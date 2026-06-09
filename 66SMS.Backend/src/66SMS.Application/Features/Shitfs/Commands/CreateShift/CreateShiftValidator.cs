using FluentValidation;

namespace _66SMS.Application.Features.Shitfs.Commands.CreateShift
{
    public class CreateShiftValidator : AbstractValidator<CreateShiftCommand>
    {
        public CreateShiftValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.ShiftPeriod).NotNull();

            When(x => x.ShiftPeriod is not null, () =>
            {
                RuleFor(x => x.ShiftPeriod.ShiftStart).NotNull();
                RuleFor(x => x.ShiftPeriod.ShiftEnd).NotNull()
                    .GreaterThan(x => x.ShiftPeriod.ShiftStart)
                    .WithMessage("ShiftEnd phải sau ShiftStart.");
                RuleFor(x => x.ShiftPeriod.EffectiveTo)
                    .GreaterThan(x => x.ShiftPeriod.EffectiveFrom)
                    .When(x => x.ShiftPeriod.EffectiveTo.HasValue)
                    .WithMessage("EffectiveTo phải sau EffectiveFrom.");
            });
        }
    }
}
