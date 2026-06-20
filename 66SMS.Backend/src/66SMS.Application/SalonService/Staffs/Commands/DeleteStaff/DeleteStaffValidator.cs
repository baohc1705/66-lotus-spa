using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaff
{
    public class DeleteStaffValidator : AbstractValidator<DeleteStaffCommand>
    {
        public DeleteStaffValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
