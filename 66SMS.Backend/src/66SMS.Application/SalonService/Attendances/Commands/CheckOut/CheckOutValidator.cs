using FluentValidation;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckOut
{
    public class CheckOutValidator : AbstractValidator<CheckOutCommand>
    {
        public CheckOutValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
        }
    }
}
