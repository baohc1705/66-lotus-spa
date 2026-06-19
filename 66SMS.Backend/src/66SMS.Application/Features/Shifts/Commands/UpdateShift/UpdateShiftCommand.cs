using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Shifts.Commands.UpdateShift
{
    public record UpdateShiftCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public UpdateShiftPeriodDto? ShiftPeriod { get; set; }
    }

    public class UpdateShiftPeriodDto
    {
        public int? Id { get; set; }   // null = thêm mới, có giá trị = sửa existing
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
    }

}
