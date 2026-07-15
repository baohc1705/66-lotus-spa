using System.Text.Json.Serialization;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.BookingPositions.Commands.CreateBookingPositions
{
    public class CreateBookingPositionCommand : IRequest<Result<object>>
    {
        public int? RoomId { get; set; }
        public string? Name { get; set; }
        public int? SortOrder { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
       
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
