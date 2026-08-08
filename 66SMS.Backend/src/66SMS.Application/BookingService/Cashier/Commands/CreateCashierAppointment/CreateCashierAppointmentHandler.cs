using _66SMS.Application.BookingService.Appointments.Commands.CreateAppointment;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.BookingService.Cashier.Commands.CreateCashierAppointment
{
    public class CreateCashierAppointmentHandler
        : IRequestHandler<CreateCashierAppointmentCommand, Result<List<int>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly ITimeSlotSqlRepository timeSlotSqlRepository;
        private readonly IPasswordHash passwordHash;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateCashierAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IUserSqlRepository userSqlRepository,
            IRoleSqlRepository roleSqlRepository,
            IPromotionSqlRepository promotionSqlRepository,
            ITimeSlotSqlRepository timeSlotSqlRepository,
            IPasswordHash passwordHash,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.roleSqlRepository = roleSqlRepository;
            this.promotionSqlRepository = promotionSqlRepository;
            this.timeSlotSqlRepository = timeSlotSqlRepository;
            this.passwordHash = passwordHash;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<List<int>>> Handle(
            CreateCashierAppointmentCommand request,
            CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(
                IsolationLevel.Serializable,
                cancellationToken);

            try
            {
                if (!await CanStaffBookForCustomerAsync(request.ActorUserId, cancellationToken))
                {
                    transaction.Rollback();
                    return Result<List<int>>.Forbidden(
                        CustomerConst.MSG_CUSTOMER_BOOK_FOR_OTHER_FORBIDDEN,
                        ErrorCodes.ERR_FORBIDDEN);
                }

                var customer = await customerSqlRepository.AsQueryable(asNoTracking: false)
                    .Include(c => c.MembershipCard)
                    .ThenInclude(mc => mc!.Tier)
                    .FirstOrDefaultAsync(c => c.Id == request.CustomerId, cancellationToken);

                if (customer == null)
                {
                    transaction.Rollback();
                    return Result<List<int>>.NotFound(
                        CustomerConst.MSG_CUSTOMER_NOT_FOUND,
                        ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                }

                if (customer.Status == CustomerConst.STATUS_DELETED
                    || customer.Status == CustomerConst.STATUS_INACTIVED)
                {
                    transaction.Rollback();
                    return Result<List<int>>.BadRequest(
                        CustomerConst.MSG_CUSTOMER_INACTIVE,
                        ErrorCodes.ERR_CUSTOMER_INVALID);
                }

                var ensureResult = await CustomerUserEnsureHelper.EnsureCustomerUserIdAsync(
                    customer,
                    email: null,
                    userSqlRepository,
                    roleSqlRepository,
                    customerSqlRepository,
                    passwordHash,
                    sqlUnitOfWork,
                    request.ActorUserId,
                    cancellationToken);

                if (!ensureResult.IsSuccess)
                {
                    transaction.Rollback();
                    return Result<List<int>>.Failure(
                        ensureResult.Code,
                        ensureResult.Message,
                        ensureResult.ErrorCode);
                }

                var customerUserId = ensureResult.Data!;
                var discountPercent = customer.MembershipCard?.Tier?.DiscountPercent ?? 0;
                var now = DateTimeHelper.UtcNow();
                var guests = request.Guests;
                var createdAppointments = new List<Appointment>();

                var serviceIds = guests
                    .SelectMany(g => g.Services ?? [])
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

                foreach (var guest in guests)
                {
                    var mainServiceId = guest.Services?.FirstOrDefault(s => (s.ServiceId ?? 0) > 0)?.ServiceId ?? 0;
                    if (mainServiceId == 0)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE,
                            ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
                    }

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
                            return Result<List<int>>.BadRequest(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        var resolved = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            validLock.AppointmentDate, mainServiceId, validLock.SlotId,
                            validLock.StaffId, guest.SalonId, validLock.Id, cancellationToken);

                        if (resolved == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_FULL,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
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
                            return Result<List<int>>.Conflict(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_FULL,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        staffId = resolved.StaffId;
                        scheduleId = resolved.ScheduleId;
                    }

                    if (guest.SalonId.HasValue && !staffSalonPairs.Contains((staffId, guest.SalonId.Value)))
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON,
                            ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);
                    }

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
                            CreatedAt = now,
                        });
                        totalAmount += serviceInfo.SellingPrice * quantity;
                    }

                    if (discountPercent > 0 && totalAmount > 0)
                        totalAmount -= totalAmount * discountPercent / 100m;

                    TimeOnly? slotStart = slotStartById.TryGetValue(slotId, out var start) ? start : null;
                    var durationMins = appointmentServices.Sum(s => s.DurationSnapshot * s.Quantity);
                    if (durationMins <= 0) durationMins = 15;

                    // Lễ tân đặt: chờ phục vụ ngay, không yêu cầu cọc
                    var appointment = new Appointment
                    {
                        AppointmentCode = $"LH-{now:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",
                        CreatedByUserId = customerUserId,
                        StaffId = staffId,
                        SalonId = guest.SalonId,
                        ScheduleId = scheduleId,
                        SlotId = slotId,
                        PositionId = validLock != null ? validLock.PositionId : guest.PositionId,
                        LockId = validLock?.Id,
                        AppointmentDate = (DateOnly)guest.AppointmentDate!,
                        TimeApptStart = slotStart,
                        TimeApptEnd = slotStart.HasValue ? slotStart.Value.AddMinutes(durationMins) : null,
                        Status = AppointmentConst.STATUS_WAITING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        PaidAmount = 0,
                        Services = appointmentServices,
                        CreatedAt = now,
                        CreatedBy = request.ActorUserId,
                        ConfirmedAt = now,
                        DepositPercent = 0,
                        DepositDeadlineAt = null,
                        DepositRequestedAt = null,
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
                return Result<List<int>>.Created(createdAppointments.Select(a => a.Id).ToList());
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

        private async Task<bool> CanStaffBookForCustomerAsync(int actorUserId, CancellationToken cancellationToken)
        {
            if (actorUserId <= 0)
                return false;

            var hasStaffProfile = await staffSqlRepository.AsQueryable(true)
                .AnyAsync(
                    s => s.UserId == actorUserId && s.Status != StaffConst.STATUS_DELETED,
                    cancellationToken);

            if (hasStaffProfile)
                return true;

            return await userSqlRepository.AsQueryable(true)
                .AnyAsync(
                    u => u.Id == actorUserId
                        && u.UserRoles != null
                        && u.UserRoles.Any(ur =>
                            ur.Role != null
                            && ur.Role.Status == RoleConst.STATUS_ACTIVED
                            && ur.Role.Code != null
                            && ur.Role.Code.ToLower() != RoleConst.CODE_CUSTOMER),
                    cancellationToken);
        }
    }
}
