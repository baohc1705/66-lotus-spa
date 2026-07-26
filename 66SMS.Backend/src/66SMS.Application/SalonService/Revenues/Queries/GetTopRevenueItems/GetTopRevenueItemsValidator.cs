using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetTopRevenueItems
{
    public class GetTopRevenueItemsValidator : AbstractValidator<GetTopRevenueItemsQuery>
    {
        public GetTopRevenueItemsValidator()
        {
            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);

            RuleFor(x => x.Type)
                .Must(t => t is "service" or "product")
                .WithMessage(RevenueConst.MSG_INVALID_ITEM_TYPE);

            RuleFor(x => x.Limit)
                .InclusiveBetween(1, 50);
        }
    }
}
