using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission
{
    /// <summary>
    /// Validator for <see cref="UpdatePermissionCommand"/>
    /// </summary>
    public class UpdatePermissionValidator : AbstractValidator<UpdatePermissionCommand>
    {
        public UpdatePermissionValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(PermissionConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.Resource).MaximumLength(PermissionConst.RESOURCE_MAX_LENGTH).When(x => x.Resource != null);
            RuleFor(x => x.Action).MaximumLength(PermissionConst.ACTION_MAX_LENGTH).When(x => x.Action != null);
            RuleFor(x => x.Description).MaximumLength(PermissionConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
        }
    }
}
