using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Shitfs.Commands.CreateShift
{
    public class CreateShiftValidator : AbstractValidator<CreateShiftCommand>
    {
        public CreateShiftValidator()
        {
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(ShiftConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ShiftConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
            RuleFor(x => x.EffectiveFrom).NotNull();
            RuleFor(x => x.EffectiveFrom).NotNull();
        }
    }
}
