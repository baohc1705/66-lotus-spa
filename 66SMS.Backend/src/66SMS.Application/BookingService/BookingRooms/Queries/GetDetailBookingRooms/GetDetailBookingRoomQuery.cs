using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.BookingService.BookingRooms.Queries.GetDetailBookingRooms
{
    public class GetDetailBookingRoomQuery : IRequest<Result<BookingRoomDto>>
    {
        public int? Id { get; set; }
    }
}
