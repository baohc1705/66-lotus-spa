using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Products.Commands.CreateProducts
{
    public class CreateProductCommand : IRequest<Result<int>>
    {
        public int CategoryId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string Unit { get; set; }
        public decimal CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int StockQuantity { get; set; }
        public int MinStock { get; set; }
        public int Status { get; set; }
        
        public List<ProductImageDto>? Images { get; set; }
    }
}
