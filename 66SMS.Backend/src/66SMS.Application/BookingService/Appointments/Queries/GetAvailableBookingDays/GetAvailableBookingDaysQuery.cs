using _66SMS.Application.DTOs.Appointments;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Appointments.Queries.GetAvailableBookingDays
{
    public class GetAvailableBookingDaysQuery : IRequest<Result<IReadOnlyList<BookingDayDto>>>
    {
        public int Days { get; set; } = 7;
    }
}
