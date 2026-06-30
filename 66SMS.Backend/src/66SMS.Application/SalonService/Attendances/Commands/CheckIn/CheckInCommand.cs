using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckIn
{
    public record CheckInCommand : IRequest<Result<int>>
    {
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? WorkScheduleId { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
