using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceProducts.Commands.DeleteServiceProducts
{
    public class DeleteServiceProductValidator : AbstractValidator<DeleteServiceProductCommand>
    {
        public DeleteServiceProductValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
        }
    }
}
