using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.BookingService.Shifts.Commands.UpdateShift
{
    public class UpdateShiftValidator : AbstractValidator<UpdateShiftCommand>
    {
        public UpdateShiftValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ShiftConst.NAME_MAX_LENGTH).When(x => x.Name is not null);
            RuleFor(x => x.SalonId).GreaterThan(0).When(x => x.SalonId.HasValue);
            RuleFor(x => x.ShiftEnd)
                .GreaterThan(x => x.ShiftStart)
                .When(x => x.ShiftStart.HasValue && x.ShiftEnd.HasValue)
                .WithMessage(ShiftConst.MSG_SHIFT_END_AFTER_START);
        }
    }
}
