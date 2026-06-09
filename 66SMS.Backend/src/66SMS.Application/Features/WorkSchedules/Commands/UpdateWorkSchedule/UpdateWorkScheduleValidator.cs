using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Entities;
using FluentValidation;

namespace _66SMS.Application.Features.WorkSchedules.Commands.UpdateWorkSchedule
{
    public class UpdateWorkScheduleValidator :  AbstractValidator<WorkSchedule>
    {
        public UpdateWorkScheduleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.ShiftPeriodId).GreaterThan(0).When(x => x.ShiftPeriodId != null);
            RuleFor(x => x.EmployeeId).GreaterThan(0).When(x => x.EmployeeId != null);
            RuleFor(x => x.WorkDate).GreaterThanOrEqualTo(DateTimeHelper.UtcNow().ToDateOnly()).When(x => x.WorkDate != null);
        }
    }
}
