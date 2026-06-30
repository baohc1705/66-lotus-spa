using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Attendances.Commands.UpdateAttendance
{
    public record UpdateAttendanceCommand : IRequest<Result<int>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public DateTime? CheckInAt { get; set; }
        public DateTime? CheckOutAt { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
