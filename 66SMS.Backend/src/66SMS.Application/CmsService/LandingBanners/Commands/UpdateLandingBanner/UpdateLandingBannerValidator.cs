using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.UpdateLandingBanner
{
    public class UpdateLandingBannerValidator : AbstractValidator<UpdateLandingBannerCommand>
    {
        public UpdateLandingBannerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Title).MaximumLength(LandingBannerConst.TITLE_MAX_LENGTH).When(x => x.Title != null);
            RuleFor(x => x.Subtitle).MaximumLength(LandingBannerConst.SUBTITLE_MAX_LENGTH).When(x => x.Subtitle != null);
            RuleFor(x => x.BrandLabel).MaximumLength(LandingBannerConst.BRAND_LABEL_MAX_LENGTH).When(x => x.BrandLabel != null);
            RuleFor(x => x.CtaPrimaryText).MaximumLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH).When(x => x.CtaPrimaryText != null);
            RuleFor(x => x.CtaPrimaryHref).MaximumLength(LandingBannerConst.CTA_HREF_MAX_LENGTH).When(x => x.CtaPrimaryHref != null);
            RuleFor(x => x.CtaSecondaryText).MaximumLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH).When(x => x.CtaSecondaryText != null);
            RuleFor(x => x.CtaSecondaryHref).MaximumLength(LandingBannerConst.CTA_HREF_MAX_LENGTH).When(x => x.CtaSecondaryHref != null);
        }
    }
}
