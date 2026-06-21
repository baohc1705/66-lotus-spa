using FluentValidation;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetDetailServiceCategories
{
    /// <summary>
    /// Validator for <see cref="GetDetailServiceCategoriesQuery"/>
    /// </summary>
    public class GetDetailServiceCategoriesValidator : AbstractValidator<GetDetailServiceCategoriesQuery>
    {
        public GetDetailServiceCategoriesValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
