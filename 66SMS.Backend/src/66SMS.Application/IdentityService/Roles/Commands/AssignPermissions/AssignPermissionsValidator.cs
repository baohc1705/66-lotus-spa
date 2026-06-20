using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.AssignPermissions
{
    public class AssignPermissionsValidator : AbstractValidator<AssignPermissionsCommand>
    {
        public AssignPermissionsValidator()
        {
            RuleFor(x => x.RoleId).NotNull().NotEmpty();
            RuleFor(x => x.PermissionIds).NotNull().NotEmpty();
        }
    }
}
