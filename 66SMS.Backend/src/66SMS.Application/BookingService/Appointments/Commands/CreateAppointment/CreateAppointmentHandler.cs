using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Messages;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentHandler : IRequestHandler<CreateAppointmentCommand, Result<List<int>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IDomainEventPublisher domainEventPublisher;

        public CreateAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IPromotionSqlRepository promotionSqlRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            ITimeSlotSqlRepository timeSlotSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IDomainEventPublisher domainEventPublisher)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.promotionSqlRepository = promotionSqlRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.domainEventPublisher = domainEventPublisher;
        }

        public async Task<Result<List<int>>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
            try
            {
                var now = DateTimeHelper.UtcNow();
                var guests = request.Guests;

                var customerInfo = await customerSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(c => c.UserId == request.CreatedByUserId)
                    .Select(c => new
                    {
                        c.FullName,
                        c.MembershipCard!.Tier!.DiscountPercent
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                var discountPercent = customerInfo?.DiscountPercent ?? 0;

                var serviceIds = guests
                    .Where(x => x.Services != null)
                    .SelectMany(x => x.Services!)
                    .Where(x => x.ServiceId.HasValue)
                    .Select(x => x.ServiceId!.Value)
                    .Distinct()
                    .ToList();

                var servicesMap = await serviceSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => serviceIds.Contains(x.Id))
                    .Select(x => new
                    {
                        x.Id,
                        x.SellingPrice,
                        x.DurationMins
                    })
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var lockIds = guests
                    .Where(x => x.LockId.HasValue)
                    .Select(x => x.LockId!.Value)
                    .Distinct()
                    .ToList();

                var locks = await appointmentSlotLockSqlRepository.AsQueryable(asNoTracking: false)
                    .Where(x => lockIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var slotIds = guests
                    .Select(x => x.LockId.HasValue && locks.TryGetValue(x.LockId.Value, out var locked) ? locked.SlotId : x.SlotId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                var slotStarts = await timeSlotSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => slotIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.StartTime })
                    .ToDictionaryAsync(x => x.Id, x => x.StartTime, cancellationToken);

                var deposits = await AppointmentPaymentCalculator.LoadDepositPercentBySalonAsync(configAppointmentSqlRepository, guests.Select(x => x.SalonId), cancellationToken);

                var salonIds = guests
                    .Where(x => x.SalonId.HasValue)
                    .Select(x => x.SalonId!.Value)
                    .Distinct()
                    .ToList();

                var staffInSalons = await staffSqlRepository.AsQueryable(asNoTracking: true)
                    .SelectMany(s => s.StaffSalons!
                        .Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE && salonIds.Contains(ss.SalonId))
                        .Select(ss => new { StaffId = s.Id, ss.SalonId })
                    )
                    .ToDictionaryAsync(x => (x.StaffId, x.SalonId), cancellationToken);

                var createdAppointments = new List<Appointment>();

                foreach (var guest in guests)
                {
                    var services = guest.Services;
                    if (services == null || services.Count == 0 || services.All(s => (s.ServiceId ?? 0) <= 0))
                    {
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
                    }

                    var mainServiceId = services.First(s => (s.ServiceId ?? 0) > 0).ServiceId!.Value;

                    int staffId;
                    int? scheduleId;
                    AppointmentSlotLock? activeLock = null;
                    int slotId;

                    if (guest.LockId.HasValue)
                    {
                        if (!locks.TryGetValue(guest.LockId.Value, out var slotLock)
                            || slotLock.Status != AppointmentSlotLockConst.STATUS_ACTIVE
                            || slotLock.ExpiresAt <= DateTimeHelper.UtcNow())
                        {
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        var staffInfo = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            slotLock.AppointmentDate,
                            mainServiceId,
                            slotLock.SlotId,
                            slotLock.StaffId,
                            guest.SalonId,
                            slotLock.Id,
                            cancellationToken);

                        if (staffInfo == null)
                        {
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        activeLock = slotLock;
                        staffId = slotLock.StaffId;
                        scheduleId = staffInfo.ScheduleId;
                        slotId = slotLock.SlotId;
                    }
                    else
                    {
                        slotId = (int)guest.SlotId!;
                        var staffInfo = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            (DateOnly)guest.AppointmentDate!,
                            mainServiceId,
                            slotId,
                            guest.StaffId,
                            guest.SalonId,
                            null,
                            cancellationToken);

                        if (staffInfo == null)
                        {
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        staffId = staffInfo.StaffId;
                        scheduleId = staffInfo.ScheduleId;
                    }

                    if (guest.SalonId.HasValue && !staffInSalons.ContainsKey((staffId, guest.SalonId.Value)))
                    {
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON, ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);
                    }

                    var appointmentServices = new List<AppointmentService>();
                    decimal totalAmount = 0;

                    foreach (var item in services)
                    {
                        if (!item.ServiceId.HasValue || !servicesMap.TryGetValue(item.ServiceId.Value, out var serviceData))
                            continue;

                        var quantity = (int)item.Quantity!;
                        appointmentServices.Add(new AppointmentService
                        {
                            ServiceId = serviceData.Id,
                            PriceSnapshot = serviceData.SellingPrice,
                            DurationSnapshot = serviceData.DurationMins,
                            Quantity = quantity,
                            Status = AppointmentServiceConst.STATUS_ACTIVE,
                            CreatedAt = now
                        });
                        totalAmount += serviceData.SellingPrice * quantity;
                    }

                    if (discountPercent > 0 && totalAmount > 0)
                        totalAmount -= totalAmount * discountPercent / 100m;

                    if (!guest.SalonId.HasValue || !deposits.TryGetValue(guest.SalonId.Value, out var depositPercent))
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                            ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
                    }

                    TimeOnly? slotStart = slotStarts.TryGetValue(slotId, out var startTime) ? startTime : null;
                    var durationMinutes = appointmentServices.Sum(s => s.DurationSnapshot * s.Quantity);

                    var appointment = new Appointment
                    {
                        AppointmentCode = $"LH-{now:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",
                        CreatedByUserId = (int)request.CreatedByUserId!,
                        StaffId = staffId,
                        SalonId = guest.SalonId,
                        ScheduleId = scheduleId,
                        SlotId = slotId,
                        PositionId = activeLock != null ? activeLock.PositionId : guest.PositionId,
                        LockId = activeLock?.Id,
                        AppointmentDate = (DateOnly)guest.AppointmentDate!,
                        TimeApptStart = slotStart,
                        TimeApptEnd = slotStart.HasValue && durationMinutes > 0
                            ? slotStart.Value.AddMinutes(durationMinutes)
                            : null,
                        Status = AppointmentConst.STATUS_PENDING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        Services = appointmentServices,
                        CreatedAt = now,
                        CreatedBy = request.CreatedByUserId,
                        DepositPercent = depositPercent
                    };

                    appointmentSqlRepository.Add(appointment);
                    createdAppointments.Add(appointment);

                    if (activeLock != null)
                    {
                        activeLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        activeLock.ReleasedAt = DateTimeHelper.UtcNow();
                        activeLock.Appointment = appointment;
                        appointmentSlotLockSqlRepository.Update(activeLock);
                    }
                }

                await appointmentSqlRepository.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.PromotionCode) && createdAppointments.Count > 0)
                {
                    var promotionResult = await ApplyPromotionAsync(
                        request.PromotionCode,
                        createdAppointments,
                        now,
                        cancellationToken);

                    if (!promotionResult.IsSuccess)
                    {
                        transaction.Rollback();
                        return promotionResult;
                    }
                }

                transaction.Commit();

                var customerName = customerInfo?.FullName;
                await domainEventPublisher.PublishAsync(new AppointmentCreatedEvent
                {
                    CustomerName = customerName,
                    Items = createdAppointments.Select(x => new AppointmentCreatedItem
                    {
                        AppointmentId = x.Id,
                        StaffId = x.StaffId,
                        SalonId = x.SalonId,
                        Status = x.Status,
                        AppointmentDate = x.AppointmentDate,
                    }).ToList(),
                }, cancellationToken);

                return Result<List<int>>.Created(createdAppointments.Select(x => x.Id).ToList());
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<Result<List<int>>> ApplyPromotionAsync(
            string promotionCode,
            List<Appointment> createdAppointments,
            DateTimeOffset now,
            CancellationToken cancellationToken)
        {
            var code = promotionCode.Trim().ToUpper();
            var promotion = await promotionSqlRepository.AsQueryable()
                .Where(p => p.Code == code && p.Status != PromotionConst.STATUS_DELETED)
                .FirstOrDefaultAsync(cancellationToken);

            if (promotion == null)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);

            if (promotion.Status != PromotionConst.STATUS_ACTIVE)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_INACTIVE, ErrorCodes.ERR_PROMOTION_INACTIVE);

            if (promotion.StartDate > now || promotion.EndDate < now)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_EXPIRED, ErrorCodes.ERR_PROMOTION_EXPIRED);

            var usageLimit = promotion.UsageLimit ?? 0;
            if (usageLimit > 0 && promotion.UsedCount >= usageLimit)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_USAGE_LIMIT, ErrorCodes.ERR_PROMOTION_USAGE_LIMIT);

            decimal orderTotal = createdAppointments.Sum(a => a.TotalAmount);

            var minOrder = promotion.MinOrderValue ?? 0m;
            if (minOrder > 0 && orderTotal < minOrder)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_MIN_ORDER, ErrorCodes.ERR_PROMOTION_MIN_ORDER);

            var discountValue = promotion.DiscountValue ?? 0m;
            var maxDiscount = promotion.MaxDiscountAmount ?? 0m;
            decimal discount = 0m;

            if (promotion.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT)
            {
                discount = Math.Round(orderTotal * discountValue / 100m, 0, MidpointRounding.AwayFromZero);
                if (maxDiscount > 0 && discount > maxDiscount)
                    discount = maxDiscount;
            }
            else if (promotion.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED)
            {
                discount = discountValue;
                if (discount > orderTotal)
                    discount = orderTotal;
            }

            if (discount > 0)
            {
                var firstAppointment = createdAppointments.First();
                firstAppointment.TotalAmount = Math.Max(0m, firstAppointment.TotalAmount - discount);
                appointmentSqlRepository.Update(firstAppointment);
            }

            promotion.UsedCount++;
            promotionSqlRepository.Update(promotion);
            await promotionSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<List<int>>.Success(createdAppointments.Select(a => a.Id).ToList());
        }
    }
}
