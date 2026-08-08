using _66SMS.Application.DTOs.TimeSlots;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Queries.GetAllTimeSlot
{
    public class GetAllTimeSlotQuery : PageRequest, IRequest<Result<PagedResult<TimeSlotDto>>>
    {
    }
}
