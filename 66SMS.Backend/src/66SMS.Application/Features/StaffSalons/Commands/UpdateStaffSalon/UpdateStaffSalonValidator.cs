using FluentValidation;

namespace _66SMS.Application.Features.StaffSalons.Commands.UpdateStaffSalon
{
    public class UpdateStaffSalonValidator : AbstractValidator<UpdateStaffSalonCommand>
    {
        public UpdateStaffSalonValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
