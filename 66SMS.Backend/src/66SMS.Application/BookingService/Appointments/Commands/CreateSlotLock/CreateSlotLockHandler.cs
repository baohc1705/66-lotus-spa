using System.Data;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
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
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateSlotLockHandler(
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<List<int>>> Handle(CreateSlotLockCommand request, CancellationToken cancellationToken)
        {
            try
            {
                using var transaction = await sqlUnitOfWork.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
                try
                {
                    var slots = await timeSlotSqlRepository.AsQueryable(asNoTracking: true)
                        .OrderBy(x => x.StartTime)
                        .Select(x => new
                        {
                            x.Id,
                            x.StartTime,
                            x.EndTime
                        })
                        .ToListAsync(cancellationToken);

                    if (slots.Count == 0)
                    {
                        return Result<List<int>>.BadRequest(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
                    }

                    var slotMinutes = TimeSlotConst.ResolveSlotMinutes(slots[0].StartTime, slots[0].EndTime);

                    var serviceIds = request.Locks
                        .Where(x => x.ServiceId.HasValue)
                        .Select(x => x.ServiceId!.Value)
                        .Distinct()
                        .ToList();

                    var durationByServiceId = await serviceSqlRepository.AsQueryable(asNoTracking: true)
                        .Where(x => serviceIds.Contains(x.Id))
                        .Select(x => new
                        {
                            x.Id,
                            x.DurationMins
                        })
                        .ToDictionaryAsync(x => x.Id, x => x.DurationMins, cancellationToken);

                    var createdLocks = new List<AppointmentSlotLock>();

                    foreach (var lockRequest in request.Locks)
                    {
                        var slotId = (int)lockRequest.SlotId!;
                        var startIndex = slots.FindIndex(s => s.Id == slotId);
                        if (startIndex < 0)
                        {
                            return Result<List<int>>.BadRequest($"Slot {slotId} không tồn tại.");
                        }

                        if (!durationByServiceId.TryGetValue((int)lockRequest.ServiceId!, out var durationMins))
                        {
                            return Result<List<int>>.BadRequest(ServiceConst.MSG_SERVICE_PRODUCT_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
                        }

                        var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(durationMins, slotMinutes);
                        if (startIndex + slotsNeeded > slots.Count)
                        {
                            return Result<List<int>>.BadRequest($"Không đủ khung giờ liên tiếp từ {slots[startIndex].StartTime:HH\\:mm} cho dịch vụ {durationMins} phút.");
                        }

                        var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            (DateOnly)lockRequest.AppointmentDate!,
                            (int)lockRequest.ServiceId!,
                            slotId,
                            lockRequest.StaffId,
                            salonId: null,
                            excludeLockId: null,
                            cancellationToken);

                        if (resolved == null)
                        {
                            var startLabel = slots[startIndex].StartTime.ToString(@"HH\:mm");
                            return Result<List<int>>.Conflict(slotsNeeded > 1
                                ? $"Khung giờ {startLabel} không đủ {durationMins} phút liên tiếp (có slot phía sau đã được đặt/giữ). Vui lòng chọn giờ khác."
                                : AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        var slotLock = new AppointmentSlotLock
                        {
                            SlotId = slotId,
                            StaffId = resolved.StaffId,
                            PositionId = lockRequest.PositionId,
                            LockedByUserId = request.LockedByUserId ?? 1,
                            AppointmentDate = (DateOnly)lockRequest.AppointmentDate!,
                            SlotsNeeded = slotsNeeded,
                            LockedAt = DateTimeHelper.UtcNow(),
                            ExpiresAt = DateTimeHelper.UtcNow().AddMinutes(AppointmentSlotLockConst.DEFAULT_LOCK_MINS), // khóa 10 phút
                            Status = AppointmentSlotLockConst.STATUS_ACTIVE
                        };

                        appointmentSlotLockSqlRepository.Add(slotLock);
                        createdLocks.Add(slotLock);
                    }

                    await appointmentSlotLockSqlRepository.SaveChangeAsync(cancellationToken);
                    transaction.Commit();
                    return Result<List<int>>.Created(createdLocks.Select(x => x.Id).ToList());
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
            catch (DbUpdateException ex) when (BookingDbConcurrency.IsUniqueViolation(ex))
            {
                return Result<List<int>>.Conflict(AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
            }
        }
    }
}
