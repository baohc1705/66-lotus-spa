using _66SMS.Application.DTOs.BookingRooms;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.BookingRooms.Queries.GetAllBookingRooms
{
    public class GetAllBookingRoomQuery : PageRequest, IRequest<Result<PagedResult<BookingRoomDto>>>
    {
        public string? Keyword { get; set; }
    }
}
