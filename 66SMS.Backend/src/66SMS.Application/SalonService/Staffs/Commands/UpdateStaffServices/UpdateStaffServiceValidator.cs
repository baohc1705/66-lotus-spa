using FluentValidation;
namespace _66SMS.Application.SalonService.Staffs.Commands.UpdateStaffServices;

public class UpdateStaffServiceValidator : AbstractValidator<UpdateStaffServiceCommand>
{
    public UpdateStaffServiceValidator()
    {
        RuleFor(x => x.Id).NotNull().NotEmpty();
        RuleFor(x => x.ServiceId).GreaterThan(0).When(x => x.ServiceId.HasValue);
        RuleFor(x => x.StaffId).GreaterThan(0).When(x => x.StaffId.HasValue);
    }
}
