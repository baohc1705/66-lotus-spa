using FluentValidation;

namespace _66SMS.Application.BookingService.TimeSlots.Commands.DeleteTimeSlot
{
    public class DeleteTimeSlotValidator : AbstractValidator<DeleteTimeSlotCommand>
    {
        public DeleteTimeSlotValidator()
        {
            RuleFor(x => x.Id).NotEmpty();
        }
    }
}
