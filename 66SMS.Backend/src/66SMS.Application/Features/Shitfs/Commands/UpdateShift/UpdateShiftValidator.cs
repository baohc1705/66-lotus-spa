using FluentValidation;

namespace _66SMS.Application.Features.Shitfs.Commands.UpdateShift
{
    public class UpdateShiftValidator : AbstractValidator<UpdateShiftCommand>
    {
        public UpdateShiftValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100).When(x => x.Name is not null);

            When(x => x.ShiftPeriod is not null, () =>
            {
                RuleFor(x => x.ShiftPeriod!.Id).NotNull().GreaterThan(0);
                RuleFor(x => x.ShiftPeriod!.ShiftStart).NotNull();
                RuleFor(x => x.ShiftPeriod!.ShiftEnd).NotNull()
                    .GreaterThan(x => x.ShiftPeriod!.ShiftStart)
                    .WithMessage("ShiftEnd phải sau ShiftStart.");
                RuleFor(x => x.ShiftPeriod!.EffectiveFrom).NotNull();
                RuleFor(x => x.ShiftPeriod!.EffectiveTo)
                    .GreaterThan(x => x.ShiftPeriod!.EffectiveFrom)
                    .When(x => x.ShiftPeriod!.EffectiveTo.HasValue)
                    .WithMessage("EffectiveTo phải sau EffectiveFrom.");
            });
        }
    }
}
