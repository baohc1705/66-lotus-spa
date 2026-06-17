using _66SMS.Application.DTOs.StaffSalons;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.StaffSalons.Queries.GetAllStaffSalons
{
    public class GetAllStaffSalonsQuery : PageRequest, IRequest<Result<PagedResult<StaffSalonDto>>>
    {
        public int? SalonId { get; set; }
        public int? StaffId { get; set; }
        public int? Status { get; set; }
    }
}
