using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.BookingRooms.Commands.CreateBookingRooms
{
    public class CreateBookingRoomCommand : IRequest<Result<object>>
    {
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
