using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Appointments.Queries.GetTimeSlots
{
    public class GetTimeSlotsQuery : IRequest<Result<IReadOnlyList<BookingTimeSlotDto>>>
    {
        public DateOnly? Date { get; set; }
        public int? ServiceId { get; set; }
        public int? StaffId { get; set; }
    }
}
