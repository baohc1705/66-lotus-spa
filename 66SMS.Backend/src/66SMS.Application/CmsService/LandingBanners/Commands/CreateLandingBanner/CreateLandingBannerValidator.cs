using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.CreateLandingBanner
{
    public class CreateLandingBannerValidator : AbstractValidator<CreateLandingBannerCommand>
    {
        public CreateLandingBannerValidator()
        {
            RuleFor(x => x.Title).NotEmpty().MaximumLength(LandingBannerConst.TITLE_MAX_LENGTH);
            RuleFor(x => x.Subtitle).MaximumLength(LandingBannerConst.SUBTITLE_MAX_LENGTH).When(x => x.Subtitle != null);
            RuleFor(x => x.BrandLabel).MaximumLength(LandingBannerConst.BRAND_LABEL_MAX_LENGTH).When(x => x.BrandLabel != null);
            RuleFor(x => x.CtaPrimaryText).MaximumLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH).When(x => x.CtaPrimaryText != null);
            RuleFor(x => x.CtaPrimaryHref).MaximumLength(LandingBannerConst.CTA_HREF_MAX_LENGTH).When(x => x.CtaPrimaryHref != null);
            RuleFor(x => x.CtaSecondaryText).MaximumLength(LandingBannerConst.CTA_TEXT_MAX_LENGTH).When(x => x.CtaSecondaryText != null);
            RuleFor(x => x.CtaSecondaryHref).MaximumLength(LandingBannerConst.CTA_HREF_MAX_LENGTH).When(x => x.CtaSecondaryHref != null);
        }
    }
}
