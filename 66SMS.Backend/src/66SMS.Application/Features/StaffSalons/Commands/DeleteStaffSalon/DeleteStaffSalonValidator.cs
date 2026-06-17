using FluentValidation;

namespace _66SMS.Application.Features.StaffSalons.Commands.DeleteStaffSalon
{
    public class DeleteStaffSalonValidator : AbstractValidator<DeleteStaffSalonCommand>
    {
        public DeleteStaffSalonValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
