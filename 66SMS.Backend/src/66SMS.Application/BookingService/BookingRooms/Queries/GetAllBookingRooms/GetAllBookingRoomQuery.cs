using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.BookingService.BookingRooms.Queries.GetAllBookingRooms
{
    public class GetAllBookingRoomQuery : PageRequest, IRequest<Result<PagedResult<BookingRoomDto>>>
    {
        public string? Keyword { get; set; }
        public int? SalonId { get; set; }
    }
}
