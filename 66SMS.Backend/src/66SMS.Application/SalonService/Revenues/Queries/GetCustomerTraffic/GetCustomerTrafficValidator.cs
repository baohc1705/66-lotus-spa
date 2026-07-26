using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetCustomerTraffic
{
    public class GetCustomerTrafficValidator : AbstractValidator<GetCustomerTrafficQuery>
    {
        public GetCustomerTrafficValidator()
        {
            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);

            RuleFor(x => x.Tab)
                .Must(t => t is "hour" or "day" or "date")
                .WithMessage(RevenueConst.MSG_INVALID_TAB);
        }
    }
}
