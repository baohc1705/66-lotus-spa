using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.CreateRole
{
    public class CreateRoleValidator : AbstractValidator<CreateRoleCommand>
    {
        public CreateRoleValidator()
        {
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(RoleConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).NotNull().NotEmpty().MaximumLength(RoleConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
