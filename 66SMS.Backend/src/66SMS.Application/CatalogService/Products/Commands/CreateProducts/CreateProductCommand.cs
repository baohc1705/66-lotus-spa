using _66SMS.Contract.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contract.Helpers;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Products.Commands.CreateProducts
{
    /// <summary>
    /// Create new product request
    /// </summary>
    public class CreateProductCommand : IRequest<Result<int>>
    {
        public int CategoryId { get; set; }
        //public string? Code { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string Unit { get; set; } = null!;
        public decimal CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int StockQuantity { get; set; }
        public int MinStock { get; set; }
        public int? Status { get; set; } = (int)StatusActiveEnum.ACTIVED;
        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        public List<ProductImageDto> Images { get; set; } = new();
    }
}
