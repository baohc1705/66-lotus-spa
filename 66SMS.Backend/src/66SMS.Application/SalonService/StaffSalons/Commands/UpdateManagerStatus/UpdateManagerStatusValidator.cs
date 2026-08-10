using FluentValidation;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateManagerStatus
{
    public class UpdateManagerStatusValidator : AbstractValidator<UpdateManagerStatusCommand>
    {
        public UpdateManagerStatusValidator()
        {
            RuleFor(x => x.StaffId).GreaterThan(0);
            RuleFor(x => x.SalonId).GreaterThan(0);
        }
    }
}
