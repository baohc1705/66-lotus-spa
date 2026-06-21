using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Commands.UpdateProducts
{
    /// <summary>
    /// Validator for <see cref="UpdateProductCommand"/>
    /// </summary>
    public class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductValidator()
        {
            RuleFor(x => x.Name).MaximumLength(ProductConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.Description).MaximumLength(ProductConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
            RuleFor(x => x.Unit).MaximumLength(ProductConst.UNIT_MAX_LENGTH).When(x => x.Description != null);
            RuleFor(x => x.CostPrice).GreaterThanOrEqualTo(0).When(x => x.CostPrice != null);
            RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0).When(x => x.SellingPrice != null);
            RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0).When(x => x.StockQuantity != null);
            RuleFor(x => x.MinStock).GreaterThanOrEqualTo(0).When(x => x.MinStock != null);
        }
    }
}
