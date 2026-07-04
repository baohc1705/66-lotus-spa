using FluentValidation;

namespace _66SMS.Application.SalonService.Attendances.Commands.CheckOut
{
    public class CheckOutValidator : AbstractValidator<CheckOutCommand>
    {
        public CheckOutValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
            RuleFor(x => x.WorkScheduleId).GreaterThan(0)
                .WithMessage("Vui lòng chọn ca làm việc.");
        }
    }
}
