using _66SMS.Contracts.Helpers;
using FluentValidation;

namespace _66SMS.Application.Features.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleValidator : AbstractValidator<CreateWorkScheduleCommand>
    {
        public CreateWorkScheduleValidator()
        {
            RuleFor(x => x.ShiftPeriodId).NotNull().GreaterThan(0);
            RuleFor(x => x.EmployeeId).NotNull().GreaterThan(0);
            RuleFor(x => x.WorkDate).NotNull().GreaterThan(DateTimeHelper.UtcNow().ToDateOnly());
        }
    }
}
