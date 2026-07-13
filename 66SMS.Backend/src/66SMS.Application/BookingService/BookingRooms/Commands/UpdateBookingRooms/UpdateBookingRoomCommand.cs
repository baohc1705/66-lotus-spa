using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.BookingRooms.Commands.UpdateBookingRooms
{
    public class UpdateBookingRoomCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
