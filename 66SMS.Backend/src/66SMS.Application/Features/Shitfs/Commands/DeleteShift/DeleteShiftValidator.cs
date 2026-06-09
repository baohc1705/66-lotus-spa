using FluentValidation;

namespace _66SMS.Application.Features.Shitfs.Commands.DeleteShift
{
    public class DeleteShiftValidator : AbstractValidator<DeleteShiftCommand>
    {
        public DeleteShiftValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
