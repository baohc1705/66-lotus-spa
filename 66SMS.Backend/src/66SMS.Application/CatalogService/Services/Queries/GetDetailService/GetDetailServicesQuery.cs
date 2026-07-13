using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Services.Queries.GetDetailService
{
    /// <summary>
    /// Get detail service request by id
    /// </summary>
    public class GetDetailServicesQuery : IRequest<Result<ServiceDetailDto>>
    {
        public int Id { get; set; }
    }
}
