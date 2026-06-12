using _66SMS.Application.DTOs.Staffs;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Staffs.Queries.GetAllStaffs
{
    public class GetAllStaffQuery : PageRequest, IRequest<Result<PagedResult<StaffDto>>>
    {
    }
}
