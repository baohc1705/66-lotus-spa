using FluentValidation;

namespace _66SMS.Application.Features.Shitfs.Commands.CreateShiftPeriod
{
    public class CreateShiftPeriodValidator : AbstractValidator<CreateShiftPeriodCommand>
    {
        public CreateShiftPeriodValidator()
        {
            RuleFor(x => x.ShiftId).GreaterThan(0);
            RuleFor(x => x.ShiftStart).NotNull();
            RuleFor(x => x.ShiftEnd).NotNull()
                .GreaterThan(x => x.ShiftStart.Value)
                .When(x => x.ShiftStart.HasValue)
                .WithMessage("ShiftEnd phải sau ShiftStart.");
            RuleFor(x => x.EffectiveTo)
                .GreaterThan(x => x.EffectiveFrom.Value)
                .When(x => x.EffectiveTo.HasValue && x.EffectiveFrom.HasValue)
                .WithMessage("EffectiveTo phải sau EffectiveFrom.");
        }
    }
}
