using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetTimeSlots
{
    public class GetTimeSlotsQuery : IRequest<Result<IReadOnlyList<BookingTimeSlotDto>>>
    {
        public DateOnly? Date { get; set; }
        public int? ServiceId { get; set; }
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
    }
}
