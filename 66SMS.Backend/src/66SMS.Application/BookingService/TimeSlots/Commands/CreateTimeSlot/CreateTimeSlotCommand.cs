using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.CreateTimeSlot
{
    public class CreateTimeSlotCommand : IRequest<Result<int>>
    {
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
    }
}
