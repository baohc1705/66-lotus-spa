using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    /// <summary>
    /// Get detail service request by id
    /// </summary>
    public class GetDetailServicesQuery : IRequest<Result<ServiceDto>>
    {
        public int Id { get; set; }
    }
}
