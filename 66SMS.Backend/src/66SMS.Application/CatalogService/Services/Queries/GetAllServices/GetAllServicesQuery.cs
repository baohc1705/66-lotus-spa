using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesQuery : PageRequest, IRequest<Result<PagedResult<ServiceDto>>>
    {
        public string? Includes { get; set; }
        public bool? IsActived { get; set; }
        public string? keyword { get; set; }
    }
}
