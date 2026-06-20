using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Queries.GetDetailStaff
{
    public class GetDetailStaffValidator : AbstractValidator<GetDetailStaffQuery>
    {
        public GetDetailStaffValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
