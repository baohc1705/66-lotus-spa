using FluentValidation;

namespace _66SMS.Application.SalonService.StaffSalons.Commands.CreateStaffSalon
{
    public class CreateStaffSalonValidator : AbstractValidator<CreateStaffSalonCommand>
    {
        public CreateStaffSalonValidator()
        {
            RuleFor(x => x.StaffId).NotNull().GreaterThan(0);
            RuleFor(x => x.SalonId).NotNull().GreaterThan(0);
            RuleFor(x => x.StartDate).NotNull();
        }
    }
}
