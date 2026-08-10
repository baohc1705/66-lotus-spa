using FluentValidation;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleValidator : AbstractValidator<UpdateWorkScheduleCommand>
    {
        public UpdateWorkScheduleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.ShiftId).GreaterThan(0).When(x => x.ShiftId != null);
        }
    }
}
