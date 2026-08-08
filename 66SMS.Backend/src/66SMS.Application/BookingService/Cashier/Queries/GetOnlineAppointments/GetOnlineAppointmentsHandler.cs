using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Queries.GetOnlineAppointments
{
    public sealed class GetOnlineAppointmentsHandler : IRequestHandler<GetOnlineAppointmentsQuery, Result<IReadOnlyList<CashierBookingDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;

        public GetOnlineAppointmentsHandler(
            IAppointmentSqlRepository appointmentRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository)
        {
            this.appointmentRepository = appointmentRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
        }

        public async Task<Result<IReadOnlyList<CashierBookingDto>>> Handle(
            GetOnlineAppointmentsQuery request,
            CancellationToken cancellationToken)
        {
            var query = appointmentRepository.AsQueryable()
                .Include(a => a.Position!)
                    .ThenInclude(p => p!.Room)
                .Include(a => a.Staff)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Customer!)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Staff!)
                .Include(a => a.TimeSlot!)
                .Include(a => a.Services!)
                    .ThenInclude(s => s.Service)
                .Where(a => a.Status != AppointmentConst.STATUS_CANCELLED && a.Status != AppointmentConst.STATUS_COMPLETED);

            if (request.SalonId.HasValue)
                query = query.Where(a => a.SalonId == request.SalonId.Value);

            var appointments = await query
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.TimeApptStart ?? (a.TimeSlot != null ? a.TimeSlot.StartTime : default))
                .ToListAsync(cancellationToken);

            if (appointments.Count == 0)
                return Result<IReadOnlyList<CashierBookingDto>>.Success(new List<CashierBookingDto>());

            var depositPercentBySalon = await AppointmentPaymentCalculator.LoadDepositPercentBySalonAsync(
                configAppointmentSqlRepository,
                appointments.Select(a => a.SalonId),
                cancellationToken);

            foreach (var appointment in appointments)
            {
                if (AppointmentPaymentCalculator.GetEffectiveDepositPercent(appointment, depositPercentBySalon) == null)
                    return Result<IReadOnlyList<CashierBookingDto>>.BadRequest(
                        ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                        ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
            }

            var bookingDtos = appointments.Select(a => {
                string statusStr = "pending";
                switch(a.Status)
                {
                    case AppointmentConst.STATUS_PENDING: statusStr = "pending"; break;
                    case AppointmentConst.STATUS_CONFIRMED: statusStr = "confirmed"; break;
                    case AppointmentConst.STATUS_WAITING:
                        statusStr = a.PositionId.HasValue ? "waiting" : "not-arrived";
                        break;
                    case AppointmentConst.STATUS_IN_SERVICE: statusStr = "in-progress"; break;
                    case AppointmentConst.STATUS_COMPLETED: 
                        statusStr = a.PaidAmount >= a.TotalAmount ? "paid" : "unpaid";
                        break;
                    case AppointmentConst.STATUS_CANCELLED: statusStr = "cancelled"; break;
                    case AppointmentConst.STATUS_NO_SHOW: statusStr = "not-arrived"; break;
                }

                string? customerName = a.CreatedByUser?.Customer?.FullName
                                      ?? a.CreatedByUser?.Staff?.FullName
                                      ?? a.CreatedByUser?.Username;

                string? serviceName = null;
                if (a.Services != null && a.Services.Any())
                {
                    serviceName = string.Join(", ", a.Services.Where(s => s.Service != null).Select(s => s.Service!.Name));
                    if (string.IsNullOrWhiteSpace(serviceName))
                        serviceName = null;
                }

                var durationMins = a.Services?.Sum(s => s.Service?.DurationMins ?? 0) ?? 0;
                var startTs = a.TimeApptStart ?? a.TimeSlot?.StartTime;
                TimeOnly? endTs = a.TimeApptEnd;
                if (endTs is null && startTs.HasValue && durationMins > 0)
                    endTs = startTs.Value.AddMinutes(durationMins);

                return new CashierBookingDto
                {
                    Id = a.Id.ToString(),
                    AppointmentCode = a.AppointmentCode,
                    CustomerName = customerName,
                    CustomerPhone = a.CreatedByUser?.Customer?.Phone,
                    CustomerAvatar = a.CreatedByUser?.Customer?.AvatarUrl,
                    BookingDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    ServiceName = serviceName,
                    ServiceId = a.Services?.FirstOrDefault()?.ServiceId,
                    StaffId = a.StaffId,
                    StaffName = a.Staff?.FullName,
                    StartTime = startTs?.ToString("HH:mm") ?? string.Empty,
                    EndTime = endTs?.ToString("HH:mm") ?? string.Empty,
                    Status = statusStr,
                    TotalAmount = a.TotalAmount,
                    PaidAmount = Math.Min(a.PaidAmount, a.TotalAmount),
                    DepositAmount = AppointmentPaymentCalculator.GetDepositAmount(a, depositPercentBySalon),
                    RemainingAmount = Math.Max(0m, a.TotalAmount - a.PaidAmount),
                    DepositPaid = AppointmentPaymentCalculator.HasDepositPaid(a, depositPercentBySalon),
                    DepositDeadlineAt = a.DepositDeadlineAt,
                    Note = a.Note,
                    PositionId = a.PositionId,
                    PositionName = a.Position != null
                        ? $"{a.Position.Room?.Name} — {a.Position.Name}"
                        : null,
                    PositionStatus = a.Position?.Status,
                    TimeStartService = a.TimeStartService,
                    CompletedAt = a.CompletedAt,
                };
            }).ToList();

            return Result<IReadOnlyList<CashierBookingDto>>.Success(bookingDtos);
        }
    }
}
