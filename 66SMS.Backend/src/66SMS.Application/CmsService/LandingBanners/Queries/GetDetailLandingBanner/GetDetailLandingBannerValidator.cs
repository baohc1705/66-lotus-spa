using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CmsService.LandingBanners.Queries.GetDetailLandingBanner
{
    public class GetDetailLandingBannerValidator : AbstractValidator<GetDetailLandingBannerQuery>
    {
        public GetDetailLandingBannerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
