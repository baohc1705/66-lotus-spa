using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateSlotLock
{
    public class CreateSlotLockHandler : IRequestHandler<CreateSlotLockCommand, Result<List<int>>>
    {
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IBookingAvailabilityService bookingAvailabilityService;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateSlotLockHandler(IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository, IServiceSqlRepository serviceSqlRepository, IBookingAvailabilityService bookingAvailabilityService, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
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
                var lockIds = new List<int>();
                foreach (var lockRequest in request.Locks)
                {
                    var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                        (DateOnly)lockRequest.AppointmentDate!,
                        (int)lockRequest.ServiceId!,
                        lockRequest.StaffId,
                        (int)lockRequest.SlotId!,
                        cancellationToken);

                    if (resolvedStaff == null)
                        return Result<List<int>>.BadRequest($"Slot {(int)lockRequest.SlotId} đã có người đặt, vui lòng chọn lại.");

                    var service = await serviceSqlRepository.FindByIdAsync((int)lockRequest.ServiceId);
                    if (service == null)
                        return Result<List<int>>.BadRequest(ServiceConst.MSG_SERVICE_PRODUCT_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);

                    var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(
                        service.DurationMins,
                        TimeSlotConst.DEFAULT_SLOT_MINUTES);
                    var slotLock = new AppointmentSlotLock
                    {
                        SlotId = (int)lockRequest.SlotId,
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
