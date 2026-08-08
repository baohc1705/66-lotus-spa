using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Queries.GetDetailBookingRooms
{
    public class GetDetailBookingRoomQuery : IRequest<Result<BookingRoomDto>>
    {
        public int? Id { get; set; }
    }
}
