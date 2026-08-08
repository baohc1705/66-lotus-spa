using FluentValidation;

namespace _66SMS.Application.IdentityService.Permissions.Commands.DeletePermission
{
    /// <summary>
    /// Validator for <see cref="DeletePermissionCommand"/>
    /// </summary>
    public class DeletePermissionValidator : AbstractValidator<DeletePermissionCommand>
    {
        public DeletePermissionValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
