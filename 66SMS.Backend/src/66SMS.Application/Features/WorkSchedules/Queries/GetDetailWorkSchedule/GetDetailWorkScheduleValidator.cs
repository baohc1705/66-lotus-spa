using FluentValidation;

namespace _66SMS.Application.Features.WorkSchedules.Queries.GetDetailWorkSchedule
{
    public class GetDetailWorkScheduleValidator : AbstractValidator<GetDetailWorkScheduleQuery>
    {
        public GetDetailWorkScheduleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
