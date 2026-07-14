using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.BookingService.BookingPositions.Queries.GetDetailBookingPositions
{
    public class GetDetailBookingPositionQuery : IRequest<Result<BookingPositionDto>>
    {
        public int? Id { get; set; }
    }
}
