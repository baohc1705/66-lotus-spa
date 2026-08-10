using _66SMS.Domain.Entities;
using FluentValidation;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.DeleteWorkSchedule
{
    public class DeleteWorkScheduleValidator : AbstractValidator<WorkSchedule>
    {
        public DeleteWorkScheduleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
