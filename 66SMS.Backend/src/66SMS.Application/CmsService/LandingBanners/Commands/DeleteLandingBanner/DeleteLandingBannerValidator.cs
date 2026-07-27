using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.DeleteLandingBanner
{
    public class DeleteLandingBannerValidator : AbstractValidator<DeleteLandingBannerCommand>
    {
        public DeleteLandingBannerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
