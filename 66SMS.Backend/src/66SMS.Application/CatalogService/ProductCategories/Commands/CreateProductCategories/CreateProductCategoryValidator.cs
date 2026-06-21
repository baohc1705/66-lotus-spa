using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    /// <summary>
    /// Validator for <see cref="CreateProductCategoryCommand"/>
    /// </summary>
    public class CreateProductCategoryValidator : AbstractValidator<CreateProductCategoryCommand>
    {
        public CreateProductCategoryValidator()
        {
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(ProductCategoryConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ProductCategoryConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
