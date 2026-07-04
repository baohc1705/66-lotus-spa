 using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;
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
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IServiceSqlRepository serviceSqlRepository,
            IBookingAvailabilityService bookingAvailabilityService,
            IAppointmentSlotLockSqlRepository appointmentSlotLockSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IWorkScheduleSqlRepository workScheduleSqlRepository,
            IPromotionSqlRepository promotionSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.serviceSqlRepository = serviceSqlRepository;
            this.bookingAvailabilityService = bookingAvailabilityService;
            this.appointmentSlotLockSqlRepository = appointmentSlotLockSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.workScheduleSqlRepository = workScheduleSqlRepository;
            this.promotionSqlRepository = promotionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        /// <summary>
        /// Xử lý logic tạo mới danh sách lịch hẹn vào cơ sở dữ liệu.
        /// </summary>
        public async Task<Result<List<int>>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var appointmentIds = new List<int>();
                var createdAppointments = new List<Appointment>();

                // Lấy thông tin khách hàng và thẻ thành viên để tính giảm giá chung cho các lịch hẹn
                var customer = await customerSqlRepository.AsQueryable(asNoTracking: true)
                    .Include(c => c.MembershipCard)
                    .ThenInclude(mc => mc!.Tier)
                    .FirstOrDefaultAsync(c => c.UserId == request.CreatedByUserId, cancellationToken);
                
                int discountPercent = customer?.MembershipCard?.Tier?.DiscountPercent ?? 0;

                foreach (var guest in request.Guests)
                {
                    var mainServiceId = guest.Services?.FirstOrDefault()?.ServiceId ?? 0;
                    if (mainServiceId == 0) return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_MIN_ONE_SERVICE, ErrorCodes.ERR_APPOINTMENT_MIN_ONE_SERVICE);

                    int staffId = 0;
                    int? scheduleId = null;
                    AppointmentSlotLock? validLock = null;

                    // Kiểm tra Khóa (Lock) trước tiên
                    if (guest.LockId.HasValue)
                    {
                        validLock = await appointmentSlotLockSqlRepository.FindByIdAsync(guest.LockId.Value);
                        if (validLock == null ||
                            validLock.Status != AppointmentSlotLockConst.STATUS_ACTIVE ||
                            validLock.ExpiresAt <= DateTime.UtcNow)
                        {
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_SLOT_LOCK_INVALID, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                        }

                        // Nếu Lock hợp lệ -> Bỏ qua thuật toán tìm Staff, dùng luôn thông tin đã chốt trong Lock
                        staffId = validLock.StaffId;

                        var schedule = await workScheduleSqlRepository.AsQueryable()
                            .FirstOrDefaultAsync(x => x.StaffId == staffId && x.WorkDate == validLock.AppointmentDate && x.Status == WorkScheduleConst.STATUS_ACTIVED, cancellationToken);
                        scheduleId = schedule?.Id;
                    }
                    else
                    {
                        // Nếu không có Lock (Flow đặt trực tiếp), chạy check rảnh rỗi realtime
                        var resolvedStaff = await bookingAvailabilityService.ResolveStaffAsync(
                            (DateOnly)guest.AppointmentDate!,
                            mainServiceId,
                            guest.StaffId,
                            (int)guest.SlotId!,
                            cancellationToken);

                        if (resolvedStaff == null)
                        {
                            return Result<List<int>>.Conflict(AppointmentConst.MSG_APPOINTMENT_SLOT_FULL, ErrorCodes.ERR_APPOINTMENT_SLOT_FULL);
                        }
                        staffId = resolvedStaff.Value.StaffId;
                        scheduleId = resolvedStaff.Value.ScheduleId;
                    }

                    // Validate staff thuộc đúng salon (nếu salonId được truyền)
                    if (guest.SalonId.HasValue)
                    {
                        var belongsToSalon = await staffSqlRepository.AsQueryable()
                            .AnyAsync(s => s.Id == staffId && s.StaffSalons != null && s.StaffSalons.Any(ss => ss.SalonId == guest.SalonId.Value && ss.Status == StaffSalonConst.STATUS_ACTIVE), cancellationToken);
                        if (!belongsToSalon)
                            return Result<List<int>>.BadRequest(AppointmentConst.MSG_APPOINTMENT_STAFF_NOT_IN_SALON, ErrorCodes.ERR_APPOINTMENT_STAFF_NOT_IN_SALON);
                    }

                    // Tính toán giá và tạo danh sách Service đi kèm
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
                            Status = AppointmentServiceConst.STATUS_ACTIVE, // Active
                            CreatedAt = DateTime.UtcNow
                        });
                        totalAmount += serviceEntity.SellingPrice * (int)reqService.Quantity;
                    }

                    // Áp dụng giảm giá từ thẻ thành viên
                    if (discountPercent > 0 && totalAmount > 0)
                    {
                        // Trừ trực tiếp phần trăm trên tổng bill dịch vụ
                        totalAmount -= totalAmount * discountPercent / 100m;
                    }

                    // Tạo record Appointment
                    var appointment = new Appointment
                    {
                        AppointmentCode = $"APT-{DateTime.UtcNow:yyyyMMddHHmmss}-{new Random().Next(100, 999)}",
                        CreatedByUserId = (int)request.CreatedByUserId!,
                        StaffId = staffId,
                        SalonId = guest.SalonId,
                        ScheduleId = scheduleId,
                        SlotId = (int)(validLock != null ? validLock.SlotId : guest.SlotId)!,
                        PositionId = (int)(validLock != null ? validLock.PositionId : guest.PositionId)!,
                        LockId = validLock?.Id,
                        AppointmentDate = (DateOnly)guest.AppointmentDate!,
                        Status = AppointmentConst.STATUS_PENDING,
                        Note = guest.Note,
                        TotalAmount = totalAmount,
                        PaidAmount = 0,
                        Services = appointmentServices,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = request.CreatedByUserId,
                        DepositPercent = AppointmentPaymentCalculator.DefaultDepositPercent
                    };

                    appointmentSqlRepository.Add(appointment);
                    await appointmentSqlRepository.SaveChangeAsync(cancellationToken);
                    appointmentIds.Add(appointment.Id);
                    createdAppointments.Add(appointment);

                    // Cập nhật trạng thái Lock thành "Released" (đã dùng thành công)
                    if (validLock != null)
                    {
                        validLock.Status = AppointmentSlotLockConst.STATUS_RELEASED;
                        validLock.ReleasedAt = DateTime.UtcNow;
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

                    var now = DateTime.UtcNow;
                    if (promo.StartDate > now || promo.EndDate < now)
                    {
                        transaction.Rollback();
                        return Result<List<int>>.BadRequest(PromotionConst.MSG_PROMOTION_EXPIRED, ErrorCodes.ERR_PROMOTION_EXPIRED);
                    }

                    if (promo.UsageLimit.HasValue && promo.UsedCount >= promo.UsageLimit.Value)
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
                        if (promo.MaxDiscountAmount.HasValue && discount > promo.MaxDiscountAmount.Value)
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
