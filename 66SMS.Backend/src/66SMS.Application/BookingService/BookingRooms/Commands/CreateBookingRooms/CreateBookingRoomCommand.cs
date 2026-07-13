using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.CreateBookingRooms
{
    public class CreateBookingRoomCommand : IRequest<Result<object>>
    {
        public int? SalonId { get; set; }
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
