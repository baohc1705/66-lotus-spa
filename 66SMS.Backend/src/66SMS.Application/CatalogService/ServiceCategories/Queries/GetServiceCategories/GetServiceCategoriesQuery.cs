using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetServiceCategories
{
    public class GetServiceCategoriesQuery : IRequest<Result<ServiceCategoryDto>>
    {
        public int Id { get; set; }
    }
}
