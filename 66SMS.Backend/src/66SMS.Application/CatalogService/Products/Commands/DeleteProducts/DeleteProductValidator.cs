using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Commands.DeleteProducts
{
    /// <summary>
    /// Validator for <see cref="DeleteProductCommand"/>
    /// </summary>
    public class DeleteProductValidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
