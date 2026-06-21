using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Commands.CreateProducts
{
    /// <summary>
    /// Validator for <see cref="CreateProductCommand"/>
    /// </summary>
    public class CreateProductValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductValidator()
        {
            RuleFor(x => x.Name).NotNull().MaximumLength(ProductConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(ProductConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
            RuleFor(x => x.Unit).NotNull().MaximumLength(ProductConst.UNIT_MAX_LENGTH);
            RuleFor(x => x.CostPrice).NotNull().GreaterThanOrEqualTo(0);
            RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0).When(x => x.SellingPrice != null);
            RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
            RuleFor(x => x.MinStock).GreaterThanOrEqualTo(0);
        }
    }
}
