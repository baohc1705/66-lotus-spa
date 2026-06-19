using _66SMS.Application.DTOs.Shifts;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Shifts.Queries.GetAllShift
{
    public class GetAllShiftQuery : PageRequest, IRequest<Result<PagedResult<ShiftDTO>>>
    {
    }
}
