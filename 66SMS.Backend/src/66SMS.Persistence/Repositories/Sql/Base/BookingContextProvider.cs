using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
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

        public async Task<AppointmentAvailabilityContext?> BuildContextAsync(
            DateOnly date,
            int serviceId,
            int? excludeLockId = null,
            CancellationToken cancellationToken = default)
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

            // Tính số slot theo độ dài slot THỰC TẾ trong DB (không hard-code 15').
            // Bug cũ: DEFAULT=15' trong khi slot = 30' → dịch vụ 60' bị tính 4 slot (=120') → cuối mỗi ca bị "ngoài giờ".
            var slotMinutes = TimeSlotConst.ResolveSlotMinutes(timeSlots[0].StartTime, timeSlots[0].EndTime);
            var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(service.DurationMins, slotMinutes);

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

            // Chỉ lấy NV đang làm + đã được phân công dịch vụ này (StaffService active)
            var staffWithSalons = await staffSqlRepository
                .AsQueryable()
                .Where(x => staffIdsOnDuty.Contains(x.Id) && x.Status == StaffConst.STATUS_ACTIVED)
                .Where(x => x.StaffServices != null && x.StaffServices.Any(ss =>
                    ss.ServiceId == serviceId && ss.Status == (int)StatusActiveEnum.ACTIVED))
                .Select(x => new
                {
                    Staff = x,
                    StaffSalons = x.StaffSalons!.Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE).ToList()
                })
                .ToListAsync(cancellationToken);

            var activeStaff = staffWithSalons.Select(x =>
            {
                x.Staff.StaffSalons = x.StaffSalons;
                return x.Staff;
            }).ToList();

            activeStaff = await FilterEmployeeStaffAsync(activeStaff, cancellationToken);
            if (activeStaff.Count == 0) return null;

            var activeStaffIds = activeStaff.Select(s => s.Id).ToHashSet();
            var staffShiftWindows = new Dictionary<int, List<ShiftWindow>>();
            var staffScheduleIds = new Dictionary<int, int>();

            foreach (var ws in schedules.Where(ws => ws.ShiftPeriod != null && activeStaffIds.Contains(ws.StaffId)))
            {
                if (!staffShiftWindows.TryGetValue(ws.StaffId, out var windows))
                {
                    windows = new List<ShiftWindow>();
                    staffShiftWindows[ws.StaffId] = windows;
                }
                windows.Add(new ShiftWindow(ws.ShiftPeriod!.ShiftStart, ws.ShiftPeriod.ShiftEnd));
                staffScheduleIds[ws.StaffId] = ws.Id;
            }

            // Gộp ca liền kề (vd: Sáng 08-12 + Chiều 12-16 → 08-16) để dịch vụ không bị
            // "ngoài giờ" chỉ vì nằm sát biên giữa hai ca liên tiếp.
            foreach (var staffId in staffShiftWindows.Keys.ToList())
            {
                staffShiftWindows[staffId] = MergeContiguousWindows(staffShiftWindows[staffId]);
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
                var duration = appointment.Services?.Sum(bs => bs.DurationSnapshot * bs.Quantity) ?? slotMinutes;
                var needed = TimeSlotConst.CalcSlotsNeeded(duration, slotMinutes);
                MarkConsecutiveSlots(bookedSlots, appointment.StaffId, appointment.SlotId, needed, timeSlots);
            }

            var locksQuery = appointmentSlotLockSqlRepository
                .AsQueryable()
                .Where(x => x.AppointmentDate == date && x.Status == AppointmentSlotLockConst.STATUS_ACTIVE && x.ExpiresAt > now);

            if (excludeLockId.HasValue)
                locksQuery = locksQuery.Where(x => x.Id != excludeLockId.Value);

            var locks = await locksQuery.ToListAsync(cancellationToken);

            var heldSlots = new Dictionary<(int StaffId, int SlotId), byte>();
            foreach (var slotLock in locks)
            {
                // SlotsNeeded lưu lúc lock phải khớp DurationMins / độ dài slot DB (CreateSlotLock đã ResolveSlotMinutes).
                // Không hard-code DEFAULT để tránh khóa lệch (vd chọn 8:30 khóa nhầm từ 8:00).
                var lockSlotsNeeded = slotLock.SlotsNeeded > 0 ? slotLock.SlotsNeeded : slotsNeeded;
                MarkConsecutiveSlots(heldSlots, slotLock.StaffId, slotLock.SlotId, lockSlotsNeeded, timeSlots);
            }

            return new AppointmentAvailabilityContext(
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

                // Dùng Role.Code (không phải Name) — Name có thể là "Nhân viên" / "Staff".
                var isStaffRole = user.UserRoles != null && user.UserRoles.Any(ur =>
                    ur.Role != null
                    && ur.Role.Status == RoleConst.STATUS_ACTIVED
                    && string.Equals(ur.Role.Code, RoleConst.CODE_STAFF, StringComparison.OrdinalIgnoreCase));

                if (isStaffRole)
                {
                    staffs.Add(staff);
                }
            }

            return staffs;
        }

        /// <summary>
        /// Gộp các ca làm việc liền kề/chồng nhau thành một cửa sổ giờ liên tục.
        /// </summary>
        private static List<ShiftWindow> MergeContiguousWindows(List<ShiftWindow> windows)
        {
            if (windows.Count <= 1) return windows;

            var ordered = windows.OrderBy(w => w.ShiftStart).ToList();
            var merged = new List<ShiftWindow> { ordered[0] };

            for (var i = 1; i < ordered.Count; i++)
            {
                var last = merged[^1];
                var current = ordered[i];
                // Ca = liền kề hoặc chồng (12:00 kết thúc ca trước = 12:00 bắt đầu ca sau)
                if (current.ShiftStart <= last.ShiftEnd)
                {
                    var end = current.ShiftEnd > last.ShiftEnd ? current.ShiftEnd : last.ShiftEnd;
                    merged[^1] = new ShiftWindow(last.ShiftStart, end);
                }
                else
                {
                    merged.Add(current);
                }
            }

            return merged;
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
