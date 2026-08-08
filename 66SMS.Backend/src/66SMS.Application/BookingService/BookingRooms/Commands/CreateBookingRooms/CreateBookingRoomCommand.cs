using _66SMS.Contract.Shared;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
    /// <summary>
    /// Command để tạo phòng đặt khách hàng.
    /// </summary>
    public class CreateBookingRoomCommand : IRequest<Result<object>>
    {
        public int? SalonId { get; set; }
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
    }
}
