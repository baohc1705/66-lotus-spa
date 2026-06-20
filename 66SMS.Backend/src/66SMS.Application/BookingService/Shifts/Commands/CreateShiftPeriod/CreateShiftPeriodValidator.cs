using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.BookingService.Shifts.Commands.CreateShiftPeriod
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
                .WithMessage(ShiftConst.MSG_SHIFT_END_AFTER_START);
            RuleFor(x => x.EffectiveTo)
                .GreaterThan(x => x.EffectiveFrom.Value)
                .When(x => x.EffectiveTo.HasValue && x.EffectiveFrom.HasValue)
                .WithMessage(ShiftConst.MSG_SHIFT_EFFECTIVE_TO_AFTER_FROM);
        }
    }
}
