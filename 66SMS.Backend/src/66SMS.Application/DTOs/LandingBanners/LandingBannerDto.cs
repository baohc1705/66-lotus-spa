namespace _66SMS.Application.DTOs.LandingBanners
{
    public class LandingBannerDto
    {
        public int? Id { get; set; }
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? BrandLabel { get; set; }
        public string? ImageUrl { get; set; }
        public string? CtaPrimaryText { get; set; }
        public string? CtaPrimaryHref { get; set; }
        public string? CtaSecondaryText { get; set; }
        public string? CtaSecondaryHref { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
