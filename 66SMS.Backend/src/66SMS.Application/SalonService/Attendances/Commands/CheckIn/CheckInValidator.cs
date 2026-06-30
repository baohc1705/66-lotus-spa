using FluentValidation;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckIn
{
    public class CheckInValidator : AbstractValidator<CheckInCommand>
    {
        public CheckInValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
        }
    }
}
