using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock
{
    public class CreateSlotLockHandler : IRequestHandler<CreateSlotLockCommand, Result<List<int>>>
    {
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IBookingAvailabilityService bookingAvailabilityService;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateSlotLockHandler(
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IBookingAvailabilityService bookingAvailabilityService,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.bookingAvailabilityService = bookingAvailabilityService;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        /// <summary>
        /// Xử lý logic tạo một danh sách khóa giữ chỗ (Slot Lock) tạm thời (mặc định 10 phút).
        /// </summary>
        public async Task<Result<List<int>>> Handle(CreateSlotLockCommand request, CancellationToken cancellationToken)
         {
            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Lấy độ dài slot THỰC TẾ từ DB (đồng bộ với BookingContextProvider).
                // Bug cũ: hard-code DEFAULT_SLOT_MINUTES → lệch số slot bị khóa (vd slot DB = 30' nhưng tính theo 15').
                var timeSlots = await timeSlotSqlRepository
                    .AsQueryable()
                    .OrderBy(x => x.StartTime)
                    .ToListAsync(cancellationToken);

                if (timeSlots.Count == 0)
                    return Result<List<int>>.BadRequest(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);

                var slotMinutes = TimeSlotConst.ResolveSlotMinutes(
                    timeSlots[0].StartTime,
                    timeSlots[0].EndTime);

                var lockIds = new List<int>();
                foreach (var lockRequest in request.Locks)
                {
                    var slotId = (int)lockRequest.SlotId!;
                    var startIndex = timeSlots.FindIndex(s => s.Id == slotId);
                    if (startIndex < 0)
                        return Result<List<int>>.BadRequest($"Slot {slotId} không tồn tại.");

                    var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                        (DateOnly)lockRequest.AppointmentDate!,
                        (int)lockRequest.ServiceId!,
                        lockRequest.StaffId,
                        slotId,
                        salonId: null,
                        cancellationToken);

                    var service = await serviceSqlRepository.FindByIdAsync((int)lockRequest.ServiceId);
                    if (service == null)
                        return Result<List<int>>.BadRequest(ServiceConst.MSG_SERVICE_PRODUCT_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);

                    var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(service.DurationMins, slotMinutes);

                    // Không đủ slot liên tiếp phía sau giờ bắt đầu
                    if (startIndex + slotsNeeded > timeSlots.Count)
                        return Result<List<int>>.BadRequest(
                            $"Không đủ khung giờ liên tiếp từ {timeSlots[startIndex].StartTime:HH\\:mm} cho dịch vụ {service.DurationMins} phút.");

                    if (resolvedStaff == null)
                    {
                        var startLabel = timeSlots[startIndex].StartTime.ToString(@"HH\:mm");
                        return Result<List<int>>.BadRequest(
                            slotsNeeded > 1
                                ? $"Khung giờ {startLabel} không đủ {service.DurationMins} phút liên tiếp (có slot phía sau đã được đặt/giữ). Vui lòng chọn giờ khác."
                                : $"Slot {startLabel} đã có người đặt, vui lòng chọn lại.");
                    }

                    var slotLock = new AppointmentSlotLock
                    {
                        SlotId = slotId,
                        StaffId = resolvedStaff.Value.StaffId,
                        PositionId = (int)lockRequest.PositionId!,
                        LockedByUserId = request.LockedByUserId ?? 1,
                        AppointmentDate = (DateOnly)lockRequest.AppointmentDate,
                        SlotsNeeded = slotsNeeded,
                        LockedAt = DateTimeHelper.UtcNow(),
                        ExpiresAt = DateTimeHelper.UtcNow().AddMinutes(10),
                        Status = AppointmentSlotLockConst.STATUS_ACTIVE
                    };

                    appointmentSlotLockSqlRepository.Add(slotLock);
                    await appointmentSlotLockSqlRepository.SaveChangeAsync(cancellationToken);
                    lockIds.Add(slotLock.Id);
                }

                transaction.Commit();
                return Result<List<int>>.Created(lockIds);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
