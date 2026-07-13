using _66SMS.Contracts.Shared;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Application.DTOs;

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
