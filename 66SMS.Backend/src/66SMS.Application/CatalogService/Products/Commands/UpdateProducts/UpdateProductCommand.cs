using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contract.Helpers;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Products.Commands.UpdateProducts
{
    public class UpdateProductCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int? CategoryId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string? Unit { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int? StockQuantity { get; set; }
        public int? MinStock { get; set; }
        public int? Status { get; set; }
        public List<ProductImageDto>? Images { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
