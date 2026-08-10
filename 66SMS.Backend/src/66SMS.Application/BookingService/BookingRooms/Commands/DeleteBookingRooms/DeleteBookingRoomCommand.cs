using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.DeleteBookingRooms
{
    /// <summary>
    /// Command để xóa phòng <see cref="BookingRoom"/>.
    /// </summary>
    public class DeleteBookingRoomCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
    }
}
