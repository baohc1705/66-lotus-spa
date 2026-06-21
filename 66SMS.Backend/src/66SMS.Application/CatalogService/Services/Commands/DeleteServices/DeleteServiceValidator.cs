using FluentValidation;

namespace _66SMS.Application.CatalogService.Services.Commands.DeleteServices
{
    /// <summary>
    /// Validator for <see cref="DeleteServiceCommand"/>
    /// </summary>
    public class DeleteServiceValidator : AbstractValidator<DeleteServiceCommand>
    {
        public DeleteServiceValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
