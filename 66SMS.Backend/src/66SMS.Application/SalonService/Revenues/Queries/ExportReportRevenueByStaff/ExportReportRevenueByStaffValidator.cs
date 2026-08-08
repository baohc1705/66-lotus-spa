using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportReportRevenueByStaff
{
    public class ExportReportRevenueByStaffValidator : AbstractValidator<ExportReportRevenueByStaffQuery>
    {
        public ExportReportRevenueByStaffValidator()
        {
            RuleFor(x => x.From).LessThanOrEqualTo(x => x.To).WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);
        }
    }
}
