using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

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

      
        public async Task<Result<List<int>>> Handle(CreateSlotLockCommand request, CancellationToken cancellationToken)
        {
            for (var attempt = 0; attempt <= BookingDbConcurrency.MaxDeadlockRetries; attempt++)
            {
                try
                {
                    return await TryCreateLocksAsync(request, cancellationToken);
                }
                catch (DbUpdateException ex) when (BookingDbConcurrency.IsUniqueViolation(ex))
                {
                    return Result<List<int>>.Conflict(
                        AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT,
                        ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                }
                catch (Exception ex) when (BookingDbConcurrency.IsDeadlock(ex) && attempt < BookingDbConcurrency.MaxDeadlockRetries)
                {
                    await Task.Delay(40 * (attempt + 1), cancellationToken);
                }
            }

            return Result<List<int>>.Conflict(
                AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT,
                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
        }

        private async Task<Result<List<int>>> TryCreateLocksAsync(
            CreateSlotLockCommand request,
            CancellationToken cancellationToken)
        {
            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);
            try
            {
                var timeSlots = await timeSlotSqlRepository
                    .AsQueryable()
                    .OrderBy(x => x.StartTime)
                    .ToListAsync(cancellationToken);

                if (timeSlots.Count == 0)
                {
                    transaction.Rollback();
                    return Result<List<int>>.BadRequest(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
                }

                var slotMinutes = TimeSlotConst.ResolveSlotMinutes(
                    timeSlots[0].StartTime,
                    timeSlots[0].EndTime);

                var lockIds = new List<int>();
                foreach (var lockRequest in request.Locks)
                {
                    var slotId = (int)lockRequest.SlotId!;
                    var startIndex = timeSlots.FindIndex(s => s.Id == slotId);
                    if (startIndex < 0)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest($"Slot {slotId} không tồn tại.");
                    }

                    var service = await serviceSqlRepository.FindByIdAsync((int)lockRequest.ServiceId!);
                    if (service == null)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(ServiceConst.MSG_SERVICE_PRODUCT_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
                    }

                    var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(service.DurationMins, slotMinutes);

                    if (startIndex + slotsNeeded > timeSlots.Count)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            $"Không đủ khung giờ liên tiếp từ {timeSlots[startIndex].StartTime:HH\\:mm} cho dịch vụ {service.DurationMins} phút.");
                    }

                    var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                        (DateOnly)lockRequest.AppointmentDate!,
                        (int)lockRequest.ServiceId!,
                        lockRequest.StaffId,
                        slotId,
                        salonId: null,
                        excludeLockId: null,
                        cancellationToken);

                    if (resolvedStaff == null)
                    {
                        transaction.Rollback();
                        var startLabel = timeSlots[startIndex].StartTime.ToString(@"HH\:mm");
                        return Result<List<int>>.Conflict(slotsNeeded > 1 
                                ? $"Khung giờ {startLabel} không đủ {service.DurationMins} phút liên tiếp (có slot phía sau đã được đặt/giữ). Vui lòng chọn giờ khác."
                                : AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT,
                            ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                    }

                    var slotLock = new AppointmentSlotLock
                    {
                        SlotId = slotId,
                        StaffId = resolvedStaff.Value.StaffId,
                        PositionId = lockRequest.PositionId,
                        LockedByUserId = request.LockedByUserId ?? 1,
                        AppointmentDate = (DateOnly)lockRequest.AppointmentDate!,
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
