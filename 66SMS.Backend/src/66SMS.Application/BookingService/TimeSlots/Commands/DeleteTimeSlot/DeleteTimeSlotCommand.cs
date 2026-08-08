using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.DeleteTimeSlot
{
    public class DeleteTimeSlotCommand : IRequest<Result<int>>
    {
        public int Id { get; set; }

        public DeleteTimeSlotCommand(int id)
        {
            Id = id;
        }
    }
}
