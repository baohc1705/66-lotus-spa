using _66SMS.Application.DTOs.Cashier;
using _66SMS.Application.Services.Appointments;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Cashier.Queries.GetOnlineAppointments
{
    public sealed class GetOnlineAppointmentsHandler(
        IAppointmentSqlRepository appointmentRepository)
        : IRequestHandler<GetOnlineAppointmentsQuery, Result<IReadOnlyList<CashierBookingDto>>>
    {
        public async Task<Result<IReadOnlyList<CashierBookingDto>>> Handle(
            GetOnlineAppointmentsQuery request,
            CancellationToken cancellationToken)
        {
            
            var appointments = await appointmentRepository.AsQueryable()
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u.Customer)
                .Include(a => a.CreatedByUser)
                    .ThenInclude(u => u.Staff)
                .Include(a => a.TimeSlot)
                .Include(a => a.Services)
                    .ThenInclude(s => s.Service)
                .Where(a => a.StaffId == null && a.Status != AppointmentConst.STATUS_CANCELLED && a.Status != AppointmentConst.STATUS_COMPLETED)
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

                return new CashierBookingDto
                {
                    Id = a.Id.ToString(),
                    CustomerName = customerName,
                    CustomerPhone = a.CreatedByUser?.Customer?.Phone,
                    CustomerAvatar = a.CreatedByUser?.Customer?.AvatarUrl,
                    BookingDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    ServiceName = serviceName,
                    StaffId = a.StaffId.ToString(),
                    StaffName = "Chưa xếp nhân viên",
                    StartTime = a.TimeSlot?.StartTime.ToString("HH:mm") ?? "00:00",
                    EndTime = a.TimeSlot?.EndTime.ToString("HH:mm") ?? "00:00",
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
