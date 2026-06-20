using _66SMS.Application.DTOs.ProductCategories;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    public class GetAllProductCategoryQuery : PageRequest, IRequest<Result<PagedResult<ProductCategoryDto>>>
    {
    }
}
