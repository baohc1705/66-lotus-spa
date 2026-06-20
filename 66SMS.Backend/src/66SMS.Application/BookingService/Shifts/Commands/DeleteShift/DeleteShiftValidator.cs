using FluentValidation;

namespace _66SMS.Application.BookingService.Shifts.Commands.DeleteShift
{
    public class DeleteShiftValidator : AbstractValidator<DeleteShiftCommand>
    {
        public DeleteShiftValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
