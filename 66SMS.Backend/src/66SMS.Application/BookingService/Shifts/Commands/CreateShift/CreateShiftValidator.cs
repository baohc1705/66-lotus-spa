using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.BookingService.Shifts.Commands.CreateShift
{
    public class CreateShiftValidator : AbstractValidator<CreateShiftCommand>
    {
        public CreateShiftValidator()
        {
            RuleFor(x => x.SalonId).NotNull().GreaterThan(0).WithMessage(ShiftConst.MSG_SHIFT_SALON_REQUIRED);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ShiftConst.NAME_MAX_LENGTH);
            RuleFor(x => x.ShiftStart).NotNull();
            RuleFor(x => x.ShiftEnd).NotNull()
                .GreaterThan(x => x.ShiftStart)
                .WithMessage(ShiftConst.MSG_SHIFT_END_AFTER_START);
        }
    }
}
