using _66SMS.Application.DTOs.BookingRooms;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.BookingRooms.Queries.GetDetailBookingRooms
{
    public class GetDetailBookingRoomQuery : IRequest<Result<BookingRoomDto>>
    {
        public int? Id { get; set; }
    }
}
