using _66SMS.Application.DTOs.BookingPositions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions
{
    public class GetAllBookingPositionQuery : PageRequest, IRequest<Result<PagedResult<BookingPositionDto>>>
    {
        public int? RoomId { get; set; }
        public string? Keyword { get; set; }
    }
}
