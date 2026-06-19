using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.Features.Shifts.Commands.UpdateShift
{
    public class UpdateShiftValidator : AbstractValidator<UpdateShiftCommand>
    {
        public UpdateShiftValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100).When(x => x.Name is not null);

            When(x => x.ShiftPeriod is not null, () =>
            {
                RuleFor(x => x.ShiftPeriod!.ShiftStart).NotNull();
                RuleFor(x => x.ShiftPeriod!.ShiftEnd).NotNull()
                    .GreaterThan(x => x.ShiftPeriod!.ShiftStart)
                    .WithMessage(ShiftConst.MSG_SHIFT_END_AFTER_START);
                RuleFor(x => x.ShiftPeriod!.EffectiveFrom).NotNull();
                RuleFor(x => x.ShiftPeriod!.EffectiveTo)
                    .GreaterThan(x => x.ShiftPeriod!.EffectiveFrom)
                    .When(x => x.ShiftPeriod!.EffectiveTo.HasValue)
                    .WithMessage(ShiftConst.MSG_SHIFT_EFFECTIVE_TO_AFTER_FROM);
            });
        }
    }
}
