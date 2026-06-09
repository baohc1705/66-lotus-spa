using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Shitfs.Commands.CreateShiftPeriod
{
    public record CreateShiftPeriodCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? ShiftId { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
    }
}
