using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.CreateLandingBanner
{
    public class CreateLandingBannerCommand : IRequest<Result<object>>
    {
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? BrandLabel { get; set; }
        public string? ImageUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public string? CtaPrimaryText { get; set; }
        public string? CtaPrimaryHref { get; set; }
        public string? CtaSecondaryText { get; set; }
        public string? CtaSecondaryHref { get; set; }
        public int? SortOrder { get; set; } = 0;
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;

        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
