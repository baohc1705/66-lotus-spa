using _66SMS.Contracts.Shared;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.SalonService.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsQuery : PageRequest, IRequest<Result<PagedResult<SalonDto>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = true;
    }
}
