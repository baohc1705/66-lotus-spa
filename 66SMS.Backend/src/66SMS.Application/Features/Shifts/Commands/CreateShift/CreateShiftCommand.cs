using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Shifts.Commands.CreateShift
{
    public record CreateShiftCommand : IRequest<Result<object>>
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public CreateShiftPeriodDto ShiftPeriod { get; set; }

    }

    public record CreateShiftPeriodDto
    {
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
    }
}
