using _66SMS.Application.DTOs;
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
            var serviceIds = request.ServiceIds;
            if (serviceIds == null || serviceIds.Count == 0)
            {
                serviceIds = new List<int>();
                if (request.ServiceId.HasValue && request.ServiceId.Value > 0)
                    serviceIds.Add(request.ServiceId.Value);
            }
            if (serviceIds.Count == 0)
                return Result<IReadOnlyList<BookingTimeSlotDto>>.Success([]);

            var rows = await appointmentSqlRepository.GetBookingTimeSlotsAsync(
                (DateOnly)request.Date!,
                serviceIds,
                request.StaffId,
                request.SalonId,
                cancellationToken);

            var result = new List<BookingTimeSlotDto>();
            for (var index = 0; index < rows.Count; index++)
            {
                var row = rows[index];
                result.Add(new BookingTimeSlotDto
                {
                    SlotId = row.SlotId,
                    Time = row.Time,
                    StartTime = row.Time,
                    Status = row.Status,
                });
            }

            return Result<IReadOnlyList<BookingTimeSlotDto>>.Success(result);
        }
    }
}
