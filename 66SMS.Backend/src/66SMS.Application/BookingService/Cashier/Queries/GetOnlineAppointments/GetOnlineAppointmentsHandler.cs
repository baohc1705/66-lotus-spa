using _66SMS.Application.DTOs.Cashier;
using _66SMS.Application.Services.Appointments;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetOnlineAppointments
{
    public sealed class GetOnlineAppointmentsHandler(
        IAppointmentSqlRepository appointmentRepository)
        : IRequestHandler<GetOnlineAppointmentsQuery, Result<IReadOnlyList<CashierBookingDto>>>
    {
        public async Task<Result<IReadOnlyList<CashierBookingDto>>> Handle(
            GetOnlineAppointmentsQuery request,
            CancellationToken cancellationToken)
        {
            
            var query = appointmentRepository.AsQueryable()
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u!.Customer)
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u!.Staff)
                .Include(a => a.TimeSlot)
                .Include(a => a.Services)
                    .ThenInclude(s => s.Service)
                .Where(a => a.StaffId == null && a.Status != AppointmentConst.STATUS_CANCELLED && a.Status != AppointmentConst.STATUS_COMPLETED);

            if (request.SalonId.HasValue)
            {
                query = query.Where(a => a.SalonId == request.SalonId.Value);
            }

            var appointments = await query
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.TimeSlot != null ? a.TimeSlot.StartTime : default)
                .ToListAsync(cancellationToken);

            if (appointments.Count == 0)
            {
                return Result<IReadOnlyList<CashierBookingDto>>.Success(new List<CashierBookingDto>());
            }

            var bookingDtos = appointments.Select(a => {
                string statusStr = "pending";
                switch(a.Status)
                {
                    case AppointmentConst.STATUS_PENDING: statusStr = "pending"; break;
                    case AppointmentConst.STATUS_CONFIRMED: statusStr = "waiting"; break;
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
                    StaffName = "Chưa xếp nhân viên",
                    StartTime = startTs.ToString("HH:mm"),
                    EndTime = endTs.ToString("HH:mm"),
                    Status = statusStr,
                    TotalAmount = a.TotalAmount,
                    PaidAmount = a.PaidAmount,
                    DepositAmount = AppointmentPaymentCalculator.GetDepositAmount(a.TotalAmount, a.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent),
                    RemainingAmount = a.TotalAmount - a.PaidAmount,
                    DepositPaid = AppointmentPaymentCalculator.HasDepositPaid(a),
                    DepositDeadlineAt = a.DepositDeadlineAt,
                    Note = a.Note
                };
            }).ToList();

            return Result<IReadOnlyList<CashierBookingDto>>.Success(bookingDtos);
        }
    }
}
