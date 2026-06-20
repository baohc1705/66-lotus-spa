using FluentValidation;

namespace _66SMS.Application.SalonService.Salons.Commands.DeleteSalon
{
    public class DeleteSalonValidator : AbstractValidator<DeleteSalonCommand>
    {
        public DeleteSalonValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
