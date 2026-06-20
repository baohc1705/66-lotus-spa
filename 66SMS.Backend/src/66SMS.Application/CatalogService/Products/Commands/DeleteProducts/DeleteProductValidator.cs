using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProducts
{
    public class DeleteProductValidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
