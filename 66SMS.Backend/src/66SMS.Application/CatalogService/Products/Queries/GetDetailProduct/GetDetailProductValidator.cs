using FluentValidation;

namespace _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct
{
    /// <summary>
    /// Validator for <see cref="GetDetailProductQuery"/>
    /// </summary>
    public class GetDetailProductValidator : AbstractValidator<GetDetailProductQuery>
    {
        public GetDetailProductValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
