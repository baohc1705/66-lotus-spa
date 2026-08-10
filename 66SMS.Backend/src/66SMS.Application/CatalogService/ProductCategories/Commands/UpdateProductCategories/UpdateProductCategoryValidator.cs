using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.ProductCategories.Commands.UpdateProductCategories
{
    /// <summary>
    /// Validator for <see cref="UpdateProductCategoryCommand"/>
    /// </summary>
    public class UpdateProductCategoryValidator : AbstractValidator<UpdateProductCategoryCommand>
    {
        public UpdateProductCategoryValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(ProductCategoryConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.Description).MaximumLength(ProductCategoryConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
        }
    }
}
