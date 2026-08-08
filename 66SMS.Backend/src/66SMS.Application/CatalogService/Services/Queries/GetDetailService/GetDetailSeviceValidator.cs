using FluentValidation;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    /// <summary>
    /// Validator for <see cref="GetDetailServicesQuery"/>
    /// </summary>
    public class GetDetailSeviceValidator : AbstractValidator<GetDetailServicesQuery>
    {
        public GetDetailSeviceValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
