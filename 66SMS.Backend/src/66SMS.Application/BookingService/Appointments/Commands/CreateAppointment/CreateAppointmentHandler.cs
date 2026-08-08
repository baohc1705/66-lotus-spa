using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
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
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(IsolationLevel.Serializable,cancellationToken);
            try
            {
                var now = DateTimeHelper.UtcNow();
                var guests = request.Guests;

                foreach (var guest in guests)
                {
                    if (guest.Services == null || guest.Services.Count == 0 || guest.Services.All(s => (s.ServiceId ?? 0) <= 0))
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
                }

                var customerInfo = await customerSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(c => c.UserId == request.CreatedByUserId)
                    .Select(c => new
                    {
                        c.FullName,
                        DiscountPercent = c.MembershipCard != null && c.MembershipCard.Tier != null
                            ? c.MembershipCard.Tier.DiscountPercent
                            : 0
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                var discountPercent = customerInfo?.DiscountPercent ?? 0;

                var serviceIds = guests
                    .SelectMany(g => g.Services!)
                    .Where(s => s.ServiceId.HasValue)
                    .Select(s => s.ServiceId!.Value)
                    .Distinct()
                    .ToList();

                var servicesById = await serviceSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => serviceIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.SellingPrice, x.DurationMins })
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var lockIds = guests.Where(g => g.LockId.HasValue).Select(g => g.LockId!.Value).Distinct().ToList();
                var locksById = lockIds.Count == 0
                    ? new Dictionary<int, AppointmentSlotLock>()
                    : await appointmentSlotLockSqlRepository.AsQueryable(asNoTracking: false)
                        .Where(x => lockIds.Contains(x.Id))
                        .ToDictionaryAsync(x => x.Id, cancellationToken);

                var slotIds = guests
                    .Select(g => g.LockId.HasValue && locksById.TryGetValue(g.LockId.Value, out var l) ? l.SlotId : g.SlotId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                var slotStartById = slotIds.Count == 0
                    ? new Dictionary<int, TimeOnly>()
                    : await timeSlotSqlRepository.AsQueryable(asNoTracking: true)
                        .Where(x => slotIds.Contains(x.Id))
                        .Select(x => new { x.Id, x.StartTime })
                        .ToDictionaryAsync(x => x.Id, x => x.StartTime, cancellationToken);

                var depositBySalon = await AppointmentPaymentCalculator.LoadDepositPercentBySalonAsync(
                    configAppointmentSqlRepository,
                    guests.Select(g => g.SalonId),
                    cancellationToken);

                var salonIds = guests.Where(g => g.SalonId.HasValue).Select(g => g.SalonId!.Value).Distinct().ToList();
                var staffSalonPairs = salonIds.Count == 0
                    ? new HashSet<(int StaffId, int SalonId)>()
                    : (await staffSqlRepository.AsQueryable(asNoTracking: true)
                        .SelectMany(s => s.StaffSalons!
                            .Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE && salonIds.Contains(ss.SalonId))
                            .Select(ss => new { StaffId = s.Id, ss.SalonId }))
                        .ToListAsync(cancellationToken))
                        .Select(x => (x.StaffId, x.SalonId))
                        .ToHashSet();

                var createdAppointments = new List<Appointment>();

                foreach (var guest in guests)
                {
                    var mainServiceId = guest.Services!.FirstOrDefault(s => (s.ServiceId ?? 0) > 0)?.ServiceId ?? 0;
                    if (mainServiceId == 0)
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);

                    int staffId;
                    int? scheduleId;
                    AppointmentSlotLock? validLock = null;
                    int slotId;

                    if (guest.LockId.HasValue)
                    {
                        if (!locksById.TryGetValue(guest.LockId.Value, out validLock)
                            || validLock.Status != AppointmentSlotLockConst.STATUS_ACTIVE
                            || validLock.ExpiresAt <= DateTimeHelper.UtcNow())
                        {
                            transaction.Rollback();
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            validLock.AppointmentDate, mainServiceId, validLock.SlotId,
                            validLock.StaffId, guest.SalonId, validLock.Id, cancellationToken);

                        if (resolved == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        staffId = validLock.StaffId;
                        scheduleId = resolved.ScheduleId;
                        slotId = validLock.SlotId;
                    }
                    else
                    {
                        slotId = (int)guest.SlotId!;
                        var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            (DateOnly)guest.AppointmentDate!, mainServiceId, slotId,
                            guest.StaffId, guest.SalonId, null, cancellationToken);

                        if (resolved == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        staffId = resolved.StaffId;
                        scheduleId = resolved.ScheduleId;
                    }

                    if (guest.SalonId.HasValue && !staffSalonPairs.Contains((staffId, guest.SalonId.Value)))
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON, ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);

                    var appointmentServices = new List<AppointmentService>();
                    decimal totalAmount = 0;

                    foreach (var reqService in guest.Services!)
                    {
                        if (!reqService.ServiceId.HasValue || !servicesById.TryGetValue(reqService.ServiceId.Value, out var serviceInfo))
                            continue;

                        var quantity = (int)reqService.Quantity!;
                        appointmentServices.Add(new AppointmentService
                        {
                            ServiceId = serviceInfo.Id,
                            PriceSnapshot = serviceInfo.SellingPrice,
                            DurationSnapshot = serviceInfo.DurationMins,
                            Quantity = quantity,
                            Status = AppointmentServiceConst.STATUS_ACTIVE,
                            CreatedAt = now
                        });
                        totalAmount += serviceInfo.SellingPrice * quantity;
                    }

                    if (discountPercent > 0 && totalAmount > 0)
                        totalAmount -= totalAmount * discountPercent / 100m;

                    var depositPercent = guest.SalonId.HasValue
                        && depositBySalon.TryGetValue(guest.SalonId.Value, out var fromConfig)
                            ? fromConfig
                            : AppointmentPaymentCalculator.DefaultDepositPercent;

                    TimeOnly? slotStart = slotStartById.TryGetValue(slotId, out var start) ? start : null;
                    var durationMins = appointmentServices.Sum(s => s.DurationSnapshot * s.Quantity);
                    if (durationMins <= 0) durationMins = 15;

                    var appointment = new Appointment
                    {
                        AppointmentCode = $"LH-{now:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",
                        CreatedByUserId = (int)request.CreatedByUserId!,
                        StaffId = staffId,
                        SalonId = guest.SalonId,
                        ScheduleId = scheduleId,
                        SlotId = slotId,
                        PositionId = validLock != null ? validLock.PositionId : guest.PositionId,
                        LockId = validLock?.Id,
                        AppointmentDate = (DateOnly)guest.AppointmentDate!,
                        TimeApptStart = slotStart,
                        TimeApptEnd = slotStart.HasValue ? slotStart.Value.AddMinutes(durationMins) : null,
                        Status = AppointmentConst.STATUS_PENDING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        PaidAmount = 0,
                        Services = appointmentServices,
                        CreatedAt = now,
                        CreatedBy = request.CreatedByUserId,
                        DepositPercent = depositPercent
                    };

                    appointmentSqlRepository.Add(appointment);
                    createdAppointments.Add(appointment);

                    if (validLock != null)
                    {
                        validLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        validLock.ReleasedAt = DateTimeHelper.UtcNow();
                        validLock.Appointment = appointment;
                        appointmentSlotLockSqlRepository.Update(validLock);
                    }
                }

                await appointmentSqlRepository.SaveChangeAsync(cancellationToken);

                if (!string.IsNullOrWhiteSpace(request.PromotionCode) && createdAppointments.Count > 0)
                {
                    var promoResult = await ApplyPromotionAsync(
                        request.PromotionCode,
                        createdAppointments,
                        now,
                        cancellationToken);

                    if (!promoResult.IsSuccess)
                    {
                        transaction.Rollback();
                        return promoResult;
                    }
                }

                transaction.Commit();

                var appointmentIds = createdAppointments.Select(a => a.Id).ToList();
                var customerName = customerInfo?.FullName ?? "Khách hàng";
                var staffIds = createdAppointments.Select(a => a.StaffId).Distinct().ToList();
                var staffUserByStaffId = await staffSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(s => staffIds.Contains(s.Id))
                    .Select(s => new { s.Id, s.UserId })
                    .ToDictionaryAsync(s => s.Id, s => s.UserId, cancellationToken);

                var bookedAt = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");
                foreach (var created in createdAppointments)
                {
                    staffUserByStaffId.TryGetValue(created.StaffId, out var staffUserId);

                    await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
                    {
                        Domain = NotificationConst.DOMAIN_BOOKING,
                        EventType = NotificationConst.EVENT_APPOINTMENT_CREATED,
                        Title = "Lịch hẹn mới",
                        Message = $"Khách hàng {customerName} vừa đặt lịch hẹn #{created.Id} vào lúc {bookedAt}",
                        SalonId = created.SalonId,
                        StaffUserId = staffUserId,
                        Payload = new BookingNotificationPayload
                        {
                            AppointmentId = created.Id,
                            StaffId = created.StaffId,
                            Status = created.Status,
                            CustomerName = customerName,
                            AppointmentDate = created.AppointmentDate,
                        },
                    }, cancellationToken);
                }

                return Result<List<int>>.Created(appointmentIds);
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
            var promo = await promotionSqlRepository.AsQueryable()
                .Where(p => p.Code == code && p.Status != PromotionConst.STATUS_DELETED)
                .FirstOrDefaultAsync(cancellationToken);

            if (promo == null)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);

            if (promo.Status != PromotionConst.STATUS_ACTIVE)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_INACTIVE, ErrorCodes.ERR_PROMOTION_INACTIVE);

            if (promo.StartDate > now || promo.EndDate < now)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_EXPIRED, ErrorCodes.ERR_PROMOTION_EXPIRED);

            if (promo.UsageLimit > 0 && promo.UsedCount >= promo.UsageLimit.Value)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_USAGE_LIMIT, ErrorCodes.ERR_PROMOTION_USAGE_LIMIT);

            decimal grandTotal = createdAppointments.Sum(a => a.TotalAmount);

            if (promo.MinOrderValue.HasValue && grandTotal < promo.MinOrderValue.Value)
                return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_MIN_ORDER, ErrorCodes.ERR_PROMOTION_MIN_ORDER);

            decimal discount = 0m;
            if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT)
            {
                var percent = promo.DiscountValue ?? 0m;
                discount = Math.Round(grandTotal * percent / 100m, 0, MidpointRounding.AwayFromZero);
                if (promo.MaxDiscountAmount > 0 && discount > promo.MaxDiscountAmount.Value)
                    discount = promo.MaxDiscountAmount.Value;
            }
            else if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED)
            {
                discount = promo.DiscountValue ?? 0m;
                if (discount > grandTotal)
                    discount = grandTotal;
            }

            if (discount > 0)
            {
                var firstApp = createdAppointments.First();
                firstApp.TotalAmount = Math.Max(0m, firstApp.TotalAmount - discount);
                firstApp.Note = string.IsNullOrWhiteSpace(firstApp.Note)
                    ? $"[Đã áp dụng mã: {promo.Code} giảm {discount:N0}đ]"
                    : $"{firstApp.Note} [Đã áp dụng mã: {promo.Code} giảm {discount:N0}đ]";
                appointmentSqlRepository.Update(firstApp);
            }

            promo.UsedCount++;
            promotionSqlRepository.Update(promo);
            await promotionSqlRepository.SaveChangeAsync(cancellationToken);

            return Result<List<int>>.Success(createdAppointments.Select(a => a.Id).ToList());
        }
    }
}
