using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.UpdateBookingPositions
{
    public class UpdateBookingPositionCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public int? RoomId { get; set; }
        public string? Name { get; set; }
        public int? SortOrder { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
