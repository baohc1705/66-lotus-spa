using _66SMS.Application.DTOs.ProductImages;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductImages.Queries.GetAllProductImages
{
    public class GetAllProductImageQuery : PageRequest, IRequest<Result<PagedResult<ProductImageDto>>>
    {
        public int? ProductId { get; set; }
    }
}
