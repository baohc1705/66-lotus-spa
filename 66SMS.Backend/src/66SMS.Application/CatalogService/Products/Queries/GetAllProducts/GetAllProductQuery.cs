using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.Products.Queries.GetAllProducts
{
    /// <summary>
    /// Get all product request
    /// </summary>
    public class GetAllProductQuery : PageRequest, IRequest<Result<PagedResult<ProductDto>>>
    {
        public int? CategoryId { get; set; }
        public string? Keyword { get; set; }
        public decimal? MinPrice {  get; set; }
        public decimal? MaxPrice {  get; set; }
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
