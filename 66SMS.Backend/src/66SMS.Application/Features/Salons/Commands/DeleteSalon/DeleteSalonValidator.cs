using FluentValidation;

namespace _66SMS.Application.Features.Salons.Commands.DeleteSalon
{
    public class DeleteSalonValidator : AbstractValidator<DeleteSalonCommand>
    {
        public DeleteSalonValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
