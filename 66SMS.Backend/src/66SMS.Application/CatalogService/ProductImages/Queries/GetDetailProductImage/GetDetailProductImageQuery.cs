using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Queries.GetDetailProductImage
{
    public class GetDetailProductImageQuery : IRequest<Result<ProductImageDto>>
    {
        public int Id { get; set; }
    }
}
