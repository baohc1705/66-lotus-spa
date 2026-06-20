using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.CreateProductCategories
{
    public class CreateProductCategoryValidator : AbstractValidator<CreateProductCategoryCommand>
    {
        public CreateProductCategoryValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(ProductCategoryConst.NAME_MAX_LENGTH);

            RuleFor(x => x.Description).MaximumLength(ProductCategoryConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
