using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ProductCategories.Queries.GetAllProductCategories
{
    /// <summary>
    /// Get all category request
    /// </summary>
    public class GetAllProductCategoryQuery : PageRequest, IRequest<Result<PagedResult<ProductCategoryDto>>>
    {
        public bool IsDeleted { get; set; } = false;
    }
}
