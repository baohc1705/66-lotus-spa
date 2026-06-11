using _66SMS.Application.DTOs.Services;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Services.Queries.GetServices
{
    public class GetServicesQuery : IRequest<Result<ServiceDto>>
    {
        public int Id { get; set; }
    }
}
