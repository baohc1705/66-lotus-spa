using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopStaff
{
    public class GetTopStaffValidator : AbstractValidator<GetTopStaffQuery>
    {
        public GetTopStaffValidator()
        {
            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 50);
        }
    }
}
