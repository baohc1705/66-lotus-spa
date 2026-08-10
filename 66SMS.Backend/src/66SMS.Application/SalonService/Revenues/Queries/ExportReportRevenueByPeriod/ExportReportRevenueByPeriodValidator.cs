using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByPeriod
{
    public class ExportReportRevenueByPeriodValidator : AbstractValidator<ExportReportRevenueByPeriodQuery>
    {
        private static readonly string[] AllowedGrains = ["day", "week", "month", "quarter", "year"];

        public ExportReportRevenueByPeriodValidator()
        {
            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);

            RuleFor(x => x.Grain)
                .Must(g => AllowedGrains.Contains(g, StringComparer.OrdinalIgnoreCase))
                .WithMessage(RevenueConst.MSG_INVALID_GRAIN);
        }
    }
}
