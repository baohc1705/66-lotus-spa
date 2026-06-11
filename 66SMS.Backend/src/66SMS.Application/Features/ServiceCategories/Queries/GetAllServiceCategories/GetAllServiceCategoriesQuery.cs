using _66SMS.Application.DTOs.ServiceCategories;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.ServiceCategories.Queries.GetAllServiceCategories
{
    public class GetAllServiceCategoriesQuery : PageRequest, IRequest<Result<PagedResult<ServiceCategoryDto>>>
    {
    }
}
