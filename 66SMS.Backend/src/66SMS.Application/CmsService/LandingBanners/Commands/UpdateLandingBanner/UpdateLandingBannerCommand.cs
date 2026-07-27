using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CmsService.LandingBanners.Commands.UpdateLandingBanner
{
    public class UpdateLandingBannerCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
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
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
    }
}
