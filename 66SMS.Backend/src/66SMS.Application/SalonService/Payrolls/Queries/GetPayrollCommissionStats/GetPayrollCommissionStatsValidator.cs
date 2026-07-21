using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.SalonService.Payrolls.Queries.GetPayrollCommissionStats
{
    public class GetPayrollCommissionStatsValidator : AbstractValidator<GetPayrollCommissionStatsQuery>
    {
        public GetPayrollCommissionStatsValidator()
        {
            RuleFor(x => x.FromDate)
                .LessThanOrEqualTo(x => x.ToDate)
                .WithMessage(PayrollConst.MSG_INVALID_DATE_RANGE);

            RuleFor(x => x)
                .Must(x => x.ToDate.DayNumber - x.FromDate.DayNumber + 1 <= PayrollConst.STATS_MAX_RANGE_DAYS)
                .WithMessage(PayrollConst.MSG_DATE_RANGE_TOO_LARGE);
        }
    }
}
