using FluentValidation;

namespace _66SMS.Application.Features.Auth.Commands.AssignPermissions
{
    public class AssignPermissionsCommandValidator : AbstractValidator<AssignPermissionsCommand>
    {
        public AssignPermissionsCommandValidator()
        {
            RuleFor(x => x.RoleId).NotNull().NotEmpty();
            RuleFor(x => x.PermissionIds).NotNull().NotEmpty();
        }
    }
}
