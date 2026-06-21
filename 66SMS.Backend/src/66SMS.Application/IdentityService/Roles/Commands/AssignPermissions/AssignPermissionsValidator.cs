using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.AssignPermissions
{
    /// <summary>
    /// Validator for <see cref="AssignPermissionsCommand"/>
    /// </summary>
    public class AssignPermissionsValidator : AbstractValidator<AssignPermissionsCommand>
    {
        public AssignPermissionsValidator()
        {
            RuleFor(x => x.RoleId).NotNull().GreaterThan(0);
            RuleFor(x => x.PermissionIds).NotNull().ForEach(x => x.NotNull().GreaterThan(0));
        }
    }
}
