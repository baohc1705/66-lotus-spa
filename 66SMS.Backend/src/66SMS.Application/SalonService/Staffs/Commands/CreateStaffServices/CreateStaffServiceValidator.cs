using FluentValidation;
namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaffServices;

public class CreateStaffServiceValidator : AbstractValidator<CreateStaffServiceCommand> 
{
    public CreateStaffServiceValidator()
    {
        RuleFor(x => x.StaffId).NotNull().GreaterThan(0);
        RuleFor(x => x.ServiceIds).NotNull().NotEmpty().Must(x => x!.Distinct().Count() == x!.Count);
    }
}
