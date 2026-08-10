using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleWeekly
{
    public class GetMyStaffScheduleWeeklyValidator : AbstractValidator<GetMyStaffScheduleWeeklyQuery>
    {
        public GetMyStaffScheduleWeeklyValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0);
            RuleFor(x => x.WeekStart)
                .Must(d => !d.HasValue || d.Value.DayOfWeek == DayOfWeek.Monday)
                .WithMessage("weekStart phải là thứ Hai.");
        }
    }
}
