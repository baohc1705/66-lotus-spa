using _66SMS.Contract.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetAllBookingPositions
{
    public class GetAllBookingPositionQuery : PageRequest, IRequest<Result<PagedResult<BookingPositionDto>>>
    {
        public int? RoomId { get; set; }
        public string? Keyword { get; set; }
    }
}
