using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffMultiples
{
    public class DeleteStaffMultiplesValidator : AbstractValidator<DeleteStaffMultiplesCommand>
    {
        public DeleteStaffMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
