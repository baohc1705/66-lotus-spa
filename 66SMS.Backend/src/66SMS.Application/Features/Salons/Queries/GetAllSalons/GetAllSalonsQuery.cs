using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsQuery : PageRequest, IRequest<Result<PagedResult<SalonDto>>>
    {
        public string? Keyword { get; set; }
        public int? Status { get; set; }
    }
}
