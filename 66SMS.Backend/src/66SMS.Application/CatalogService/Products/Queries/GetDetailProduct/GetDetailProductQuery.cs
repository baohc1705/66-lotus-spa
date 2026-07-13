using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Products.Queries.GetDetailProduct
{
    /// <summary>
    /// Get detail product request
    /// </summary>
    public class GetDetailProductQuery : IRequest<Result<ProductFullDto>>
    {
        public int Id { get; set; }
    }
}
