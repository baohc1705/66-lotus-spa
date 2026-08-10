using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Shifts.Queries.GetAllShift
{
    public class GetAllShiftQuery : PageRequest, IRequest<Result<PagedResult<ShiftDTO>>>
    {
    }
}
