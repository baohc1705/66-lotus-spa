using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.CreateProductImages
{
    public class CreateProductImageCommand : IRequest<Result<int>>
    {
        public int ProductId { get; set; }
        public string? Url { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }
    }
}
