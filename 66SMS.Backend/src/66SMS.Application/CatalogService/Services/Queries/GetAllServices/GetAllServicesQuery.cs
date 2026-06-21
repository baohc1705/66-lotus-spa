using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesQuery : PageRequest, IRequest<Result<PagedResult<ServiceDto>>>
    {
        public int? CategoryId {  get; set; }
        public int? Status { get; set; }
        public string? Keyword { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
