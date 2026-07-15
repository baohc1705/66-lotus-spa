using FluentValidation;
namespace _66SMS.Application.SalonService.Staffs.Commands.DeleteStaffServices;

public class DeleteStaffServiceValidator : AbstractValidator<DeleteStaffServiceCommand>
{
    public DeleteStaffServiceValidator()
    {
        RuleFor(x => x.Ids).NotNull().NotEmpty().Must(x => x!.Distinct().Count() == x!.Count);
    }
}
