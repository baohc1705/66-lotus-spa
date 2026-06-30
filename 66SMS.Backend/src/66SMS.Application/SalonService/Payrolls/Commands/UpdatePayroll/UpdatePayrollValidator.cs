using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Payrolls.Commands.UpdatePayroll
{
    public class UpdatePayrollValidator : AbstractValidator<UpdatePayrollCommand>
    {
        public UpdatePayrollValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Note).MaximumLength(PayrollConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
