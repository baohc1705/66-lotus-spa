using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.TimeSlots.Queries.GetAllTimeSlot
{
    public class GetAllTimeSlotQuery : PageRequest, IRequest<Result<PagedResult<TimeSlotDto>>>
    {
    }
}
