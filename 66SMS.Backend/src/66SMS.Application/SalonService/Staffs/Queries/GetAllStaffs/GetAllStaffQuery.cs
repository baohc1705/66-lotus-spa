using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffs
{
    public class GetAllStaffQuery : PageRequest, IRequest<Result<PagedResult<StaffDto>>>
    {
        public int? SalonId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? Role { get; set; }
    }
}
