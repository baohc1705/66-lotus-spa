using _66SMS.Application.DTOs.BookingPositions;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetDetailBookingPositions
{
    public class GetDetailBookingPositionQuery : IRequest<Result<BookingPositionDto>>
    {
        public int? Id { get; set; }
    }
}
