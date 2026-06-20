using FluentValidation;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.UpdateStaffSalon
{
    public class UpdateStaffSalonValidator : AbstractValidator<UpdateStaffSalonCommand>
    {
        public UpdateStaffSalonValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
