using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.GetReportRevenueBySalon
{
    public class GetReportRevenueBySalonValidator : AbstractValidator<GetReportRevenueBySalonQuery>
    {
        public GetReportRevenueBySalonValidator()
        {
            RuleFor(x => x.From).LessThanOrEqualTo(x => x.To).WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);
        }
    }
}
