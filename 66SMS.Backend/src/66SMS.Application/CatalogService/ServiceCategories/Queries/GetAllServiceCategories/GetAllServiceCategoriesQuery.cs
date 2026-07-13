using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetAllServiceCategories
{
    /// <summary>
    /// Get all service category request
    /// </summary>
    public class GetAllServiceCategoriesQuery : PageRequest, IRequest<Result<PagedResult<ServiceCategoryDto>>>
    {
        public string? Keyword { get; set; }
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
