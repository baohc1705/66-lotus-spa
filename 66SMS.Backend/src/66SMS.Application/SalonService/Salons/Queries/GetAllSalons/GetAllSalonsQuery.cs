using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsQuery : PageRequest, IRequest<Result<PagedResult<SalonDto>>>
    {
        public int? Status { get; set; }
    }
}
