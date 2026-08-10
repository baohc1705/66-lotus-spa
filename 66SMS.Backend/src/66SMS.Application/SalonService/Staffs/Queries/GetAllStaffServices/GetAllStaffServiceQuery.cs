using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetAllStaffServices;

public class GetAllStaffServiceQuery : PageRequest, IRequest<Result<PagedResult<StaffServiceDto>>>
{
    public int? StaffId { get; set; }
    public int? ServiceId { get; set; }
}
