using FluentValidation;

namespace _66SMS.Application.Features.TimeSlots.Commands.UpdateTimeSlot
{
    public class UpdateTimeSlotValidator : AbstractValidator<UpdateTimeSlotCommand>
    {
        public UpdateTimeSlotValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
