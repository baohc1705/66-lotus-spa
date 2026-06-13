using _66SMS.Application.Abstractions;
using _66SMS.Application.Services.Appointments;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class BookingContextProvider : IBookingContextProvider
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        public BookingContextProvider(IServiceSqlRepository serviceSqlRepository, IStaffSqlRepository staffSqlRepository, IWorkScheduleSqlRepository workScheduleSqlRepository, ITimeSlotSqlRepository timeSlotSqlRepository, IAppointmentSqlRepository appointmentSqlRepository, IUserSqlRepository userSqlRepository, IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
        }

        public async Task<AvailabilityContext?> BuildContextAsync(DateOnly date, int serviceId, CancellationToken cancellationToken = default)
        {
            var service = await serviceSqlRepository
                .AsQueryable()
                .Where(x => x.Id == serviceId && x.Status == ServiceConst.STATUS_ACTIVED)
                .FirstOrDefaultAsync(cancellationToken);
            if (service == null) return null;

            var timeSlots = await timeSlotSqlRepository
                .AsQueryable()
                .OrderBy(x => x.StartTime)
                .ToListAsync(cancellationToken);
            if (timeSlots.Count == 0) return null;

            var slotsNeeded = Math.Max(1, (int)Math.Ceiling(service.DurationMins / (double)TimeSlotConst.DEFAULT_SLOT_MINUTES));

            var schedules = await workScheduleSqlRepository
                .AsQueryable()
                .Where(x => x.WorkDate == date && x.Status == WorkScheduleConst.STATUS_ACTIVED && x.ShiftPeriod != null)
                .Include(x => x.ShiftPeriod)
                .Include(x => x.Staff)
                .ToListAsync(cancellationToken);

            var staffIdsOnDuty = schedules
                .Where(x => x.Staff != null && x.Staff.Status == StaffConst.STATUS_ACTIVED)
                .Select(x => x.StaffId)
                .Distinct()
                .ToList();
            if (staffIdsOnDuty.Count == 0) return null;

            var activeStaff = await staffSqlRepository
                .AsQueryable()
                .Where(x => staffIdsOnDuty.Contains(x.Id) && x.Status == StaffConst.STATUS_ACTIVED)
                .ToListAsync(cancellationToken);
            activeStaff = await FilterEmployeeStaffAsync(activeStaff, cancellationToken);
            if (activeStaff.Count == 0) return null;

            var staffShiftWindows = new Dictionary<int, List<ShiftWindow>>();
            var staffScheduleIds = new Dictionary<int, int>();

            foreach (var ws in schedules.Where(ws => ws.ShiftPeriod != null))
            {
                if (!staffShiftWindows.TryGetValue(ws.StaffId, out var windows))
                {
                    windows = new List<ShiftWindow>();
                    staffShiftWindows[ws.StaffId] = windows;
                }
                windows.Add(new ShiftWindow(ws.ShiftPeriod!.ShiftStart, ws.ShiftPeriod.ShiftEnd));
                staffScheduleIds[ws.StaffId] = ws.Id;
            }

            var now = DateTimeHelper.UtcNow();
            var appointments = await appointmentSqlRepository
                .AsQueryable()
                .Where(x => x.AppointmentDate == date && x.Status != AppointmentConst.STATUS_CANCELLED)
                .Include(x => x.Services)
                .Include(x => x.TimeSlot)
                .ToListAsync(cancellationToken);

            var bookedSlots = new Dictionary<(int StaffId, int SlotId), byte>();
            foreach (var appointment in appointments)
            {
                var duration = appointment.Services?.Sum(bs => bs.DurationSnapshot * bs.Quantity) ?? TimeSlotConst.DEFAULT_SLOT_MINUTES;
                var needed = (int)Math.Ceiling(duration / (double)TimeSlotConst.DEFAULT_SLOT_MINUTES);
                MarkConsecutiveSlots(bookedSlots, appointment.StaffId, appointment.SlotId, needed, timeSlots);
            }

            var locks = await appointmentSlotLockSqlRepository
                .AsQueryable()
                .Where(x => x.AppointmentDate == date && x.Status == AppointmentSlotLockConst.STATUS_ACTIVE && x.ExpiresAt > now)
                .ToListAsync(cancellationToken);

            var heldSlots = new Dictionary<(int StaffId, int SlotId), byte>();
            foreach (var slotLock in locks)
            {
                var lockSlotsNeeded = slotLock.SlotsNeeded > 0 ? slotLock.SlotsNeeded : slotsNeeded;
                MarkConsecutiveSlots(heldSlots, slotLock.StaffId, slotLock.SlotId, lockSlotsNeeded, timeSlots);
            }

            return new AvailabilityContext(
                date,
                service.DurationMins,
                slotsNeeded,
                timeSlots,
                activeStaff,
                staffShiftWindows,
                staffScheduleIds,
                bookedSlots,
                heldSlots
            );
        }
        private async Task<List<Staff>> FilterEmployeeStaffAsync(List<Staff> staffList, CancellationToken ct)
        {
            if (staffList.Count == 0) return staffList;

            var userIds = staffList.Where(s => s.UserId > 0).Select(s => s.UserId).Distinct().ToList();
            if (userIds.Count == 0) return [];

            var users = await userSqlRepository
                .AsQueryable()
                .Where(x => userIds.Contains(x.Id))
                .Include(x => x.UserRoles!)
                    .ThenInclude(ur => ur.Role!)
                .ToListAsync(ct);
            var usersById = users.ToDictionary(u => u.Id);

            var staffs = new List<Staff>();
            foreach (var staff in staffList)
            {
                if (!usersById.TryGetValue(staff.UserId, out var user)) continue;

                if (user.UserRoles != null && user.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == "staff"))
                {
                    staffs.Add(staff);
                }
            }

            return staffs;
        }
        private static void MarkConsecutiveSlots(Dictionary<(int StaffId, int SlotId), byte> map, int staffId, int startSlotId, int slotsNeeded, IReadOnlyList<TimeSlot> timeSlots)
        {
            var startIndex = -1;
            for (var i = 0; i < timeSlots.Count; i++)
            {
                if (timeSlots[i].Id == startSlotId)
                {
                    startIndex = i;
                    break;
                }
            }
            if (startIndex < 0) return;

            for (var i = 0; i < slotsNeeded && startIndex + i < timeSlots.Count; i++)
            {
                var slotId = timeSlots[startIndex + i].Id;
                map[(staffId, slotId)] = 1;
            }
        }
    }
}
