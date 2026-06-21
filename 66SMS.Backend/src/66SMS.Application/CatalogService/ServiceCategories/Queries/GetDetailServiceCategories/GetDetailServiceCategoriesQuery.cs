using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetDetailServiceCategories
{
    /// <summary>
    /// Get detail service category request
    /// </summary>
    public class GetDetailServiceCategoriesQuery : IRequest<Result<ServiceCategoryDto>>
    {
        public int Id { get; set; }
    }
}
