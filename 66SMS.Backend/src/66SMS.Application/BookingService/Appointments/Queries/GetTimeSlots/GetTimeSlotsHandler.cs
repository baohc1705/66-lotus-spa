using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetTimeSlots
{
    public class GetTimeSlotsHandler : IRequestHandler<GetTimeSlotsQuery, Result<IReadOnlyList<BookingTimeSlotDto>>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;

        public GetTimeSlotsHandler(IAppointmentSqlRepository appointmentSqlRepository)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
        }

        public async Task<Result<IReadOnlyList<BookingTimeSlotDto>>> Handle(GetTimeSlotsQuery request, CancellationToken cancellationToken)
        {
            var rows = await appointmentSqlRepository.GetBookingTimeSlotsAsync(
                (DateOnly)request.Date!,
                (int)request.ServiceId!,
                request.StaffId,
                request.SalonId,
                cancellationToken);

            var result = rows.Select(r => new BookingTimeSlotDto
            {
                SlotId = r.SlotId,
                Time = r.Time,
                Status = r.Status,
            }).ToList();

            return Result<IReadOnlyList<BookingTimeSlotDto>>.Success(result);
        }
    }
}
