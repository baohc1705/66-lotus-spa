using _66SMS.Contract.Helpers;
using FluentValidation;

namespace _66SMS.Application.BookingService.WorkSchedules.Commands.CreateWorkSchedule
{
    public class CreateWorkScheduleValidator : AbstractValidator<CreateWorkScheduleCommand>
    {
        public CreateWorkScheduleValidator()
        {
            RuleFor(x => x.ShiftPeriodId).NotNull().GreaterThan(0);
            RuleFor(x => x.StaffId).NotNull().GreaterThan(0);
            RuleFor(x => x.WorkDate).NotNull().GreaterThanOrEqualTo(DateTimeHelper.UtcNow().ToDateOnly());
        }
    }
}
