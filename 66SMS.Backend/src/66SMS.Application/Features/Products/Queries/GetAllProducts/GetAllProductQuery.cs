using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Products.Queries.GetAllProducts
{
    public class GetAllProductQuery : PageRequest, IRequest<Result<PagedResult<ProductDto>>>
    {
        public int? CategoryId { get; set; }
        public string? Keyword { get; set; }
    }
}
