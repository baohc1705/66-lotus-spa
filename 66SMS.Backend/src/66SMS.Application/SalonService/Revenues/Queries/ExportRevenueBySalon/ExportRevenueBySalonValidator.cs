using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Revenues.Queries.ExportRevenueBySalon
{
    public class ExportRevenueBySalonValidator : AbstractValidator<ExportRevenueBySalonQuery>
    {
        public ExportRevenueBySalonValidator()
        {
            RuleFor(x => x.From)
                .LessThanOrEqualTo(x => x.To)
                .WithMessage(RevenueConst.MSG_INVALID_DATE_RANGE);
        }
    }
}
