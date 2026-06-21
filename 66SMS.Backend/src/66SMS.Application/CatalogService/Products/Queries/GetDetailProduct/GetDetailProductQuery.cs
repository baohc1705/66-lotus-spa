using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct
{
    /// <summary>
    /// Get detail product request
    /// </summary>
    public class GetDetailProductQuery : IRequest<Result<ProductDto>>
    {
        public int Id { get; set; }
    }
}
