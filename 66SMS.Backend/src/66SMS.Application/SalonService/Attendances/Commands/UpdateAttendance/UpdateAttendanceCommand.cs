using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Attendances.Commands.UpdateAttendance
{
    public record UpdateAttendanceCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public DateTimeOffset? CheckInAt { get; set; }
        public DateTimeOffset? CheckOutAt { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
