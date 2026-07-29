using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CatalogService.ProductImages.Commands.UpdateProductImages
{
    public class UpdateProductImageCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        
        public int? ProductId { get; set; }
        public string? Url { get; set; }
        public string? ImageBase64 { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsPrimary { get; set; }
    }
}
