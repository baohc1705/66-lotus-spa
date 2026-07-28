using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportBranchRevenue
{
    public class ExportBranchRevenueValidator : AbstractValidator<ExportBranchRevenueQuery>
    {
        public ExportBranchRevenueValidator()
        {
            RuleFor(x => x.SalonId)
                .GreaterThan(0)
                .WithMessage(RevenueConst.MSG_SALON_REQUIRED);

            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);
        }
    }
}
