namespace _66SMS.Application.DTOs
{
    public class ProductImageDto
    {
        public int? Id { get; set; }
        public string? Url { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
