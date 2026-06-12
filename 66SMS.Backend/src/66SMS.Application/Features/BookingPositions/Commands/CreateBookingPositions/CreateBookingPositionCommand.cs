using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.BookingPositions.Commands.CreateBookingPositions
{
    public class CreateBookingPositionCommand : IRequest<Result<object>>
    {
        public int? RoomId { get; set; }
        public string? Name { get; set; }
        public int? SortOrder { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
