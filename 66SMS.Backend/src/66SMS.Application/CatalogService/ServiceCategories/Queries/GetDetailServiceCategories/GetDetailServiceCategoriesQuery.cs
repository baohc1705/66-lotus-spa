using _66SMS.Contract.Shared;
using MediatR;
using _66SMS.Application.DTOs;

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
