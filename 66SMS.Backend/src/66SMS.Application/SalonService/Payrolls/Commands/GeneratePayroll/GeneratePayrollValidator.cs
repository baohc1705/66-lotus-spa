using FluentValidation;

namespace _66SMS.Application.SalonService.Payrolls.Commands.GeneratePayroll
{
    public class GeneratePayrollValidator : AbstractValidator<GeneratePayrollCommand>
    {
        public GeneratePayrollValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
            RuleFor(x => x.Month).InclusiveBetween(1, 12);
            RuleFor(x => x.Year).InclusiveBetween(2000, 2100);
        }
    }
}
