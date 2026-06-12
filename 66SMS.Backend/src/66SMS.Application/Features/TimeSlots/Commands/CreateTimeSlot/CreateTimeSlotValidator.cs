using FluentValidation;

namespace _66SMS.Application.Features.TimeSlots.Commands.CreateTimeSlot
{
    public class CreateTimeSlotValidator : AbstractValidator<CreateTimeSlotCommand>
    {
        public CreateTimeSlotValidator()
        {
            RuleFor(x => x.StartTime).NotEmpty();
            RuleFor(x => x.EndTime).NotEmpty();
        }
    }
}
