using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueBySalon
{
    public class ExportReportRevenueBySalonValidator : AbstractValidator<ExportReportRevenueBySalonQuery>
    {
        public ExportReportRevenueBySalonValidator()
        {
            RuleFor(x => x.From).LessThanOrEqualTo(x => x.To).WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);
        }
    }
}
