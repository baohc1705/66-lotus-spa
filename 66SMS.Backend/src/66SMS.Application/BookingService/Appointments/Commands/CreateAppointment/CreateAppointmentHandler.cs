using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Messages;
using _66SMS.Contracts.Shared;
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
        private readonly IBookingAvailabilityService bookingAvailabilityService;
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IWorkScheduleSqlRepository workScheduleSqlRepository;
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IDomainEventPublisher domainEventPublisher;

        public CreateAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            IBookingAvailabilityService bookingAvailabilityService,
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IWorkScheduleSqlRepository workScheduleSqlRepository,
            IPromotionSqlRepository promotionSqlRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            ITimeSlotSqlRepository timeSlotSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IDomainEventPublisher domainEventPublisher)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.bookingAvailabilityService = bookingAvailabilityService;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.promotionSqlRepository = promotionSqlRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.domainEventPublisher = domainEventPublisher;
        }

        public async Task<Result<List<int>>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            for (var attempt = 0; attempt <= BookingDbConcurrency.MaxDeadlockRetries; attempt++)
            {
                try
                {
                    return await TryCreateAppointmentsAsync(request, cancellationToken);
                }
                catch (Exception ex) when (BookingDbConcurrency.IsDeadlock(ex) && attempt < BookingDbConcurrency.MaxDeadlockRetries)
                {
                    await Task.Delay(40 * (attempt + 1), cancellationToken);
                }
            }

            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
        }

        private async Task<Result<List<int>>> TryCreateAppointmentsAsync(
            CreateAppointmentCommand request,
            CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);
            try
            {
                var appointmentIds = new List<int>();
                var createdAppointments = new List<Appointment>();
                var now = DateTimeHelper.UtcNow();

                var customer = await customerSqlRepository.AsQueryable(asNoTracking: true)
                    .Include(c => c.MembershipCard)
                    .ThenInclude(mc => mc!.Tier)
                    .FirstOrDefaultAsync(c => c.UserId == request.CreatedByUserId, cancellationToken);

                int discountPercent = customer?.MembershipCard?.Tier?.DiscountPercent ?? 0;

                foreach (var guest in request.Guests)
                {
                    var mainServiceId = guest.Services?.FirstOrDefault()?.ServiceId ?? 0;
                    if (mainServiceId == 0)
                        return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);

                    int staffId = 0;
                    int? scheduleId = null;
                    AppointmentSlotLock? validLock = null;

                    if (guest.LockId.HasValue)
                    {
                        validLock = await appointmentSlotLockSqlRepository.FindByIdAsync(guest.LockId.Value, asNoTracking: false);
                        if (validLock == null ||
                            validLock.Status != AppointmentSlotLockConst.STATUS_ACTIVE ||
                            validLock.ExpiresAt <= DateTimeHelper.UtcNow())
                        {
                            transaction.Rollback();
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        staffId = validLock.StaffId;

                        var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                            validLock.AppointmentDate,
                            mainServiceId,
                            validLock.StaffId,
                            validLock.SlotId,
                            salonId: guest.SalonId,
                            excludeLockId: validLock.Id,
                            cancellationToken);

                        if (resolvedStaff == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        scheduleId = resolvedStaff.Value.ScheduleId;
                        if (!scheduleId.HasValue)
                        {
                            var schedule = await workScheduleSqlRepository.AsQueryable()
                                .FirstOrDefaultAsync(x => x.StaffId == staffId && x.WorkDate == validLock.AppointmentDate && x.Status == WorkScheduleConst.STATUS_ACTIVED, cancellationToken);
                            scheduleId = schedule?.Id;
                        }
                    }
                    else
                    {
                        var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                            (DateOnly)guest.AppointmentDate!,
                            mainServiceId,
                            guest.StaffId,
                            (int)guest.SlotId!,
                            salonId: guest.SalonId,
                            excludeLockId: null,
                            cancellationToken);

                        if (resolvedStaff == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }
                        staffId = resolvedStaff.Value.StaffId;
                        scheduleId = resolvedStaff.Value.ScheduleId;
                    }

                    if (guest.SalonId.HasValue)
                    {
                        var belongsToSalon = await staffSqlRepository.AsQueryable()
                            .AnyAsync(s => s.Id == staffId && s.StaffSalons != null && s.StaffSalons.Any(ss => ss.SalonId == guest.SalonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE), cancellationToken);
                        if (!belongsToSalon)
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON, ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);
                    }

                    var appointmentServices = new List<AppointmentService>();
                    decimal totalAmount = 0;

                    foreach (var reqService in guest.Services!)
                    {
                        var serviceEntity = await serviceSqlRepository
                            .AsQueryable()
                            .Where(x => x.Id == reqService.ServiceId)
                            .FirstOrDefaultAsync(cancellationToken);
                        if (serviceEntity == null) continue;

                        appointmentServices.Add(new AppointmentService
                        {
                            ServiceId = serviceEntity.Id,
                            PriceSnapshot = serviceEntity.SellingPrice,
                            DurationSnapshot = serviceEntity.DurationMins,
                            Quantity = (int)reqService.Quantity!,
                            Status = AppointmentServiceConst.STATUS_ACTIVE,
                            CreatedAt = now
                        });
                        totalAmount += serviceEntity.SellingPrice * (int)reqService.Quantity;
                    }

                    if (discountPercent > 0 && totalAmount > 0)
                    {
                        totalAmount -= totalAmount * discountPercent / 100m;
                    }

                    var depositPercent = await AppointmentPaymentCalculator.ResolveDepositPercentAsync(
                        configAppointmentSqlRepository,
                        guest.SalonId,
                        cancellationToken);

                    var slotId = (int)(validLock != null ? validLock.SlotId : guest.SlotId)!;
                    var timeSlot = await timeSlotSqlRepository.FindByIdAsync(slotId, true, cancellationToken);
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
                        TimeApptStart = timeSlot?.StartTime,
                        TimeApptEnd = timeSlot != null
                            ? timeSlot.StartTime.AddMinutes(durationMins)
                            : null,
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
                    await appointmentSqlRepository.SaveChangeAsync(cancellationToken);
                    appointmentIds.Add(appointment.Id);
                    createdAppointments.Add(appointment);

                    if (validLock != null)
                    {
                        validLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        validLock.ReleasedAt = DateTimeHelper.UtcNow();
                        validLock.Appointment = appointment;
                        appointmentSlotLockSqlRepository.Update(validLock);
                        await appointmentSlotLockSqlRepository.SaveChangeAsync(cancellationToken);
                    }
                }

                if (!string.IsNullOrWhiteSpace(request.PromotionCode) && createdAppointments.Any())
                {
                    var code = request.PromotionCode.Trim().ToUpper();
                    var promo = await promotionSqlRepository.AsQueryable()
                        .Where(p => p.Code == code && p.Status != PromotionConst.STATUS_DELETED)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (promo == null)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);
                    }

                    if (promo.Status != PromotionConst.STATUS_ACTIVE)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_INACTIVE, ErrorCodes.ERR_PROMOTION_INACTIVE);
                    }

                    if (promo.StartDate > now || promo.EndDate < now)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_EXPIRED, ErrorCodes.ERR_PROMOTION_EXPIRED);
                    }

                    if (promo.UsageLimit > 0 && promo.UsedCount >= promo.UsageLimit.Value)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_USAGE_LIMIT, ErrorCodes.ERR_PROMOTION_USAGE_LIMIT);
                    }

                    decimal grandTotal = createdAppointments.Sum(a => a.TotalAmount);

                    if (promo.MinOrderValue.HasValue && grandTotal < promo.MinOrderValue.Value)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_MIN_ORDER, ErrorCodes.ERR_PROMOTION_MIN_ORDER);
                    }

                    decimal discount = 0m;
                    if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT)
                    {
                        var percent = promo.DiscountValue ?? 0m;
                        discount = Math.Round(grandTotal * percent / 100m, 0, MidpointRounding.AwayFromZero);
                        if (promo.MaxDiscountAmount > 0 && discount > promo.MaxDiscountAmount.Value)
                        {
                            discount = promo.MaxDiscountAmount.Value;
                        }
                    }
                    else if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED)
                    {
                        discount = promo.DiscountValue ?? 0m;
                        if (discount > grandTotal)
                        {
                            discount = grandTotal;
                        }
                    }

                    if (discount > 0)
                    {
                        var firstApp = createdAppointments.First();
                        firstApp.TotalAmount = Math.Max(0m, firstApp.TotalAmount - discount);

                        firstApp.Note = string.IsNullOrWhiteSpace(firstApp.Note)
                            ? $"[Đã áp dụng mã: {promo.Code} giảm {discount:N0}đ]"
                            : $"{firstApp.Note} [Đã áp dụng mã: {promo.Code} giảm {discount:N0}đ]";

                        appointmentSqlRepository.Update(firstApp);
                        await appointmentSqlRepository.SaveChangeAsync(cancellationToken);
                    }

                    promo.UsedCount++;
                    promotionSqlRepository.Update(promo);
                    await promotionSqlRepository.SaveChangeAsync(cancellationToken);
                }

                transaction.Commit();

                var customerName = customer?.FullName ?? "Khách hàng";
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
    }
}
