using _66SMS.Application.DTOs.Products;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Products.Queries.GetDetailProduct
{
    public class GetDetailProductQuery : IRequest<Result<ProductDto>>
    {
        public int Id { get; set; }
    }
}
