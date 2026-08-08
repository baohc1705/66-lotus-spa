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

                var servicesMap = await serviceSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => serviceIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.SellingPrice, x.DurationMins })
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var lockIds = guests.Where(g => g.LockId.HasValue).Select(g => g.LockId!.Value).Distinct().ToList();
                var locks = await appointmentSlotLockSqlRepository.AsQueryable(asNoTracking: false)
                    .Where(x => lockIds.Contains(x.Id))
                    .ToDictionaryAsync(x => x.Id, cancellationToken);

                var slotIds = guests
                    .Select(g => g.LockId.HasValue && locks.TryGetValue(g.LockId.Value, out var locked) ? locked.SlotId : g.SlotId)
                    .Where(id => id.HasValue)
                    .Select(id => id!.Value)
                    .Distinct()
                    .ToList();

                var slotStarts = await timeSlotSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(x => slotIds.Contains(x.Id))
                    .Select(x => new { x.Id, x.StartTime })
                    .ToDictionaryAsync(x => x.Id, x => x.StartTime, cancellationToken);

                var salonIds = guests.Where(g => g.SalonId.HasValue).Select(g => g.SalonId!.Value).Distinct().ToList();
                var staffInSalons = await staffSqlRepository.AsQueryable(asNoTracking: true)
                    .SelectMany(s => s.StaffSalons!
                        .Where(ss => ss.Status == StaffSalonConst.STATUS_ACTIVE && salonIds.Contains(ss.SalonId))
                        .Select(ss => new { StaffId = s.Id, ss.SalonId }))
                    .ToDictionaryAsync(x => (x.StaffId, x.SalonId), cancellationToken);

                foreach (var guest in guests)
                {
                    var services = guest.Services;
                    if (services == null || services.Count == 0 || services.All(s => (s.ServiceId ?? 0) <= 0))
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE,
                            ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);
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
                            transaction.Rollback();
                            return Result<List<int>>.BadRequest(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        var staffInfo = await appointmentSqlRepository.ResolveBookingStaffAsync(
                            slotLock.AppointmentDate, mainServiceId, slotLock.SlotId,
                            slotLock.StaffId, guest.SalonId, slotLock.Id, cancellationToken);

                        if (staffInfo == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_FULL,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
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
                            (DateOnly)guest.AppointmentDate!, mainServiceId, slotId,
                            guest.StaffId, guest.SalonId, null, cancellationToken);

                        if (staffInfo == null)
                        {
                            transaction.Rollback();
                            return Result<List<int>>.Conflict(
                                AppointmentConst.MSG_APPOINTMENT_SLOT_FULL,
                                ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }

                        staffId = staffInfo.StaffId;
                        scheduleId = staffInfo.ScheduleId;
                    }

                    if (guest.SalonId.HasValue && !staffInSalons.ContainsKey((staffId, guest.SalonId.Value)))
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(
                            AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON,
                            ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);
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
                            CreatedAt = now,
                        });
                        totalAmount += serviceData.SellingPrice * quantity;
                    }

                    if (discountPercent > 0 && totalAmount > 0)
                        totalAmount -= totalAmount * discountPercent / 100m;

                    TimeOnly? slotStart = slotStarts.TryGetValue(slotId, out var startTime) ? startTime : null;
                    var durationMinutes = appointmentServices.Sum(s => s.DurationSnapshot * s.Quantity);

                    var appointment = new Appointment
                    {
                        AppointmentCode = $"LH-{now:yyyyMMddHHmmss}{Random.Shared.Next(100, 999)}",
                        CreatedByUserId = customerUserId,
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
                        Status = AppointmentConst.STATUS_WAITING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        Services = appointmentServices,
                        CreatedAt = now,
                        CreatedBy = request.ActorUserId,
                        ConfirmedAt = now,
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
