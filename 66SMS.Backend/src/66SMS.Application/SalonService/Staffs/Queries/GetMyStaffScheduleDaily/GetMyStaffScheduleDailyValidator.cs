using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetMyStaffScheduleDaily
{
    public class GetMyStaffScheduleDailyValidator : AbstractValidator<GetMyStaffScheduleDailyQuery>
    {
        public GetMyStaffScheduleDailyValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0);
        }
    }
}
