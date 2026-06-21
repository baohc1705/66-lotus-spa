using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.DeleteProductCategories
{
    /// <summary>
    /// Validator for <see cref="DeleteProductCategoryCommand"/>
    /// </summary>
    public class DeleteProductCategoryValidator : AbstractValidator<DeleteProductCategoryCommand>
    {
        public DeleteProductCategoryValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
