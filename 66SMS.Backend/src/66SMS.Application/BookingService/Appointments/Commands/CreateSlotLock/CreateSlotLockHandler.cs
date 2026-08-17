using System.Data;
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
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateSlotLockHandler(
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            IAppointmentSqlRepository appointmentSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
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
                    var allServiceIds = new List<int>();
                    for (var lockIndex = 0; lockIndex < request.Locks.Count; lockIndex++)
                    {
                        var lockItem = request.Locks[lockIndex];
                        if (lockItem.ServiceIds != null && lockItem.ServiceIds.Count > 0)
                        {
                            for (var serviceIndex = 0; serviceIndex < lockItem.ServiceIds.Count; serviceIndex++)
                                allServiceIds.Add(lockItem.ServiceIds[serviceIndex]);
                        }
                        else if (lockItem.ServiceId.HasValue && lockItem.ServiceId.Value > 0)
                        {
                            allServiceIds.Add(lockItem.ServiceId.Value);
                        }
                    }

                    var durationByServiceId = await serviceSqlRepository.AsQueryable(asNoTracking: true)
                        .Where(x => allServiceIds.Contains(x.Id))
                        .Select(x => new
                        {
                            x.Id,
                            x.DurationMins
                        })
                        .ToDictionaryAsync(x => x.Id, x => x.DurationMins, cancellationToken);

                    var userId = request.LockedByUserId!.Value;
                    var now = DateTimeHelper.UtcNow();

                    var oldLocks = await appointmentSlotLockSqlRepository.AsQueryable(asNoTracking: false)
                        .Where(x => x.LockedByUserId == userId
                            && x.Status == AppointmentSlotLockConst.STATUS_ACTIVE)
                        .ToListAsync(cancellationToken);

                    for (var oldIndex = 0; oldIndex < oldLocks.Count; oldIndex++)
                    {
                        oldLocks[oldIndex].Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        oldLocks[oldIndex].ReleasedAt = now;
                        appointmentSlotLockSqlRepository.Update(oldLocks[oldIndex]);
                    }

                    var createdLocks = new List<AppointmentSlotLock>();

                    for (var lockIndex = 0; lockIndex < request.Locks.Count; lockIndex++)
                    {
                        var lockRequest = request.Locks[lockIndex];
                        var serviceIds = lockRequest.ServiceIds;
                        if (serviceIds == null || serviceIds.Count == 0)
                        {
                            serviceIds = new List<int>();
                            if (lockRequest.ServiceId.HasValue && lockRequest.ServiceId.Value > 0)
                                serviceIds.Add(lockRequest.ServiceId.Value);
                        }
                        if (serviceIds.Count == 0)
                        {
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
                        }

                        var slotStart = DateTimeHelper.ParseTimeOnly(lockRequest.StartTime);
                        if (slotStart == null)
                        {
                            return Result<List<int>>.BadRequest(TimeSlotConst.MSG_TIME_SLOT_NOT_FOUND, ErrorCodes.ERR_TIME_SLOT_NOT_FOUND);
                        }

                        var durationMins = 0;
                        for (var serviceIndex = 0; serviceIndex < serviceIds.Count; serviceIndex++)
                        {
                            if (!durationByServiceId.TryGetValue(serviceIds[serviceIndex], out var serviceDuration))
                            {
                                return Result<List<int>>.BadRequest(ServiceConst.MSG_SERVICE_PRODUCT_NOT_FOUND, ErrorCodes.ERR_SERVICE_NOT_FOUND);
                            }
                            durationMins += serviceDuration;
                        }

                        var slotMinutes = TimeSlotConst.DEFAULT_SLOT_MINUTES;
                        if (lockRequest.SalonId.HasValue)
                        {
                            var configSlotMinutes = await configAppointmentSqlRepository.AsQueryable(asNoTracking: true)
                                .Where(x => x.SalonId == lockRequest.SalonId.Value && x.SlotMinutes != null && x.SlotMinutes > 0)
                                .Select(x => x.SlotMinutes)
                                .FirstOrDefaultAsync(cancellationToken);
                            if (configSlotMinutes.HasValue && configSlotMinutes.Value > 0)
                            {
                                slotMinutes = configSlotMinutes.Value;
                            }
                        }

                        var slotsNeeded = TimeSlotConst.CalcSlotsNeeded(durationMins, slotMinutes);

                        var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            (DateOnly)lockRequest.AppointmentDate!,
                            serviceIds,
                            lockRequest.StaffId,
                            salonId: lockRequest.SalonId,
                            excludeLockId: null,
                            excludeAppointmentId: null,
                            startTime: slotStart,
                            cancellationToken: cancellationToken);

                        if (resolved == null)
                        {
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_NO_STAFF_FOR_SERVICE_COMBO, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        var slotEnd = slotStart.Value.AddMinutes(durationMins);

                        var slotLock = new AppointmentSlotLock
                        {
                            StaffId = resolved.StaffId,
                            PositionId = lockRequest.PositionId,
                            LockedByUserId = userId,
                            AppointmentDate = (DateOnly)lockRequest.AppointmentDate!,
                            SlotsNeeded = slotsNeeded,
                            LockedAt = now,
                            ExpiresAt = now.AddMinutes(AppointmentSlotLockConst.DEFAULT_LOCK_MINS),
                            Status = AppointmentSlotLockConst.STATUS_ACTIVE,
                            StartTime = slotStart,
                            EndTime = slotEnd,
                            DurationMins = durationMins,
                            SlotMinutes = slotMinutes,
                            SalonId = lockRequest.SalonId,
                            ServiceId = serviceIds[0]
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
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                return Result<List<int>>.Conflict(AppointmentSlotLockConst.MSG_SLOT_LOCK_CONFLICT, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
            }
        }

        private static bool IsUniqueViolation(Exception ex)
        {
            for (var e = ex; e != null; e = e.InnerException!)
            {
                var numberProp = e.GetType().GetProperty("Number");
                if (numberProp?.GetValue(e) is int number && (number == 2601 || number == 2627))
                    return true;

                if (e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase)
                    || e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase)
                    || e.Message.Contains("UX_lock_active", StringComparison.OrdinalIgnoreCase)
                    || e.Message.Contains("UX_slot_lock_active", StringComparison.OrdinalIgnoreCase))
                    return true;
            }

            return false;
        }
    }
}
