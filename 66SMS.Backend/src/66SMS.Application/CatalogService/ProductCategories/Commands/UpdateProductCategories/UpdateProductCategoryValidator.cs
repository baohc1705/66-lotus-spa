using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories
{
    public class UpdateProductCategoryValidator : AbstractValidator<UpdateProductCategoryCommand>
    {
        public UpdateProductCategoryValidator()
        {
            RuleFor(x => x.Name).MaximumLength(ProductCategoryConst.NAME_MAX_LENGTH);

            RuleFor(x => x.Description).MaximumLength(ProductCategoryConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
