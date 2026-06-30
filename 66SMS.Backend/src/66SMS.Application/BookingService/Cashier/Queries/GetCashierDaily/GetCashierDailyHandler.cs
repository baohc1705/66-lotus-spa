using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetCashierDaily
{
    public class GetCashierDailyHandler : IRequestHandler<GetCashierDailyQuery, Result<CashierDailyDto>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IStaffSqlRepository staffRepository;
        private readonly IWalletSqlRepository walletRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;

        public GetCashierDailyHandler(IAppointmentSqlRepository appointmentRepository, IStaffSqlRepository staffRepository, IWalletSqlRepository walletRepository, IStaffSalonSqlRepository staffSalonSqlRepository)
        {
            this.appointmentRepository = appointmentRepository;
            this.staffRepository = staffRepository;
            this.walletRepository = walletRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
        }

        public async Task<Result<CashierDailyDto>> Handle(GetCashierDailyQuery request, CancellationToken cancellationToken)
        {
            var dto = new CashierDailyDto();

            // Lấy danh sách nhân viên để hiển thị lên cột
            var staffsQuery = staffRepository.AsQueryable()
                .Where(x => x.User != null && x.User.UserRoles!.Any(ur => ur.Role != null && ur.Role.Name.ToLower() == "staff"));
            if (request.SalonId.HasValue)
            {
                staffsQuery = staffsQuery.Where(x => staffSalonSqlRepository.AsQueryable(true)
                    .Any(ss => ss.StaffId == x.Id 
                         && ss.SalonId == request.SalonId.Value 
                         && ss.Status == StaffSalonConst.STATUS_ACTIVE));
            }
            var staffs = await staffsQuery.ToListAsync(cancellationToken);

            dto.Columns = staffs.Select(s => new StaffColumnDto
            {
                Id = s.Id.ToString(),
                Name = s.FullName,
                Avatar = s.AvatarUrl
            }).ToList();

            // Lấy danh sách lịch hẹn trong ngày
            var appointmentsQuery = appointmentRepository.AsQueryable()
                .Include(a => a.Staff)
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u!.Customer)
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u!.Staff)
                .Include(a => a.TimeSlot)
                .Include(a => a.Services)
                    .ThenInclude(s => s.Service)
                .Where(a => a.AppointmentDate == request.Date);

            if (request.SalonId.HasValue)
            {
                appointmentsQuery = appointmentsQuery.Where(a => a.SalonId == request.SalonId.Value);
            }

            var appointments = await appointmentsQuery.ToListAsync(cancellationToken);

            var customerIds = appointments
                .Where(a => a.CreatedByUser?.Customer != null)
                .Select(a => a.CreatedByUser!.Customer!.Id)
                .Distinct()
                .ToList();

            var walletBalances = await walletRepository.AsQueryable(asNoTracking: true)
                .Where(w => customerIds.Contains(w.CustomerId))
                .ToDictionaryAsync(w => w.CustomerId, w => w.Balance, cancellationToken);

            dto.Bookings = appointments.Select(a => {
                string statusStr = "pending";
                switch(a.Status)
                {
                    case AppointmentConst.STATUS_PENDING: statusStr = "pending"; break;
                    case AppointmentConst.STATUS_CONFIRMED: statusStr = "confirmed"; break;
                    case AppointmentConst.STATUS_WAITING: statusStr = "waiting"; break;
                    case AppointmentConst.STATUS_IN_SERVICE: statusStr = "in-progress"; break;
                    case AppointmentConst.STATUS_COMPLETED: 
                        statusStr = a.PaidAmount >= a.TotalAmount ? "paid" : "unpaid";
                        break;
                    case AppointmentConst.STATUS_CANCELLED: statusStr = "cancelled"; break;
                    case AppointmentConst.STATUS_NO_SHOW: statusStr = "not-arrived"; break;
                }

                string customerName = a.CreatedByUser?.Customer?.FullName 
                                      ?? a.CreatedByUser?.Staff?.FullName 
                                      ?? a.CreatedByUser?.Username 
                                      ?? "Khách vãng lai";

                string serviceName = "Dịch vụ";
                if (a.Services != null && a.Services.Any())
                {
                    serviceName = string.Join(", ", a.Services.Where(s => s.Service != null).Select(s => s.Service?.Name));
                }

                var durationMins = a.Services?.Sum(s => s.Service?.DurationMins ?? 0) ?? 0;
                if (durationMins == 0) durationMins = 15;
                var startTs = a.TimeSlot?.StartTime ?? new TimeOnly(0, 0);
                var endTs = startTs.AddMinutes(durationMins);

                return new CashierBookingDto
                {
                    Id = a.Id.ToString(),
                    CustomerName = customerName,
                    CustomerPhone = a.CreatedByUser?.Customer?.Phone,
                    CustomerAvatar = a.CreatedByUser?.Customer?.AvatarUrl,
                    BookingDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    ServiceName = serviceName,
                    StaffId = a.StaffId,
                    StaffName = a.Staff?.FullName ?? "N/A",
                    StartTime = startTs.ToString("HH:mm"),
                    EndTime = endTs.ToString("HH:mm"),
                    Status = statusStr,
                    TotalAmount = a.TotalAmount,
                    PaidAmount = a.PaidAmount,
                    DepositAmount = AppointmentPaymentCalculator.GetDepositAmount(a.TotalAmount, a.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent),
                    RemainingAmount = a.TotalAmount - a.PaidAmount,
                    DepositPaid = AppointmentPaymentCalculator.HasDepositPaid(a),
                    DepositDeadlineAt = a.DepositDeadlineAt,
                    Note = a.Note,
                    CustomerWalletBalance = a.CreatedByUser?.Customer != null && walletBalances.TryGetValue(a.CreatedByUser.Customer.Id, out var balance) ? balance : 0m
                };
            }).ToList();

            return Result<CashierDailyDto>.Success(dto);
        }
    }
}
