using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission
{
    public class UpdatePermissionValidator : AbstractValidator<UpdatePermissionCommand>
    {
        public UpdatePermissionValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(PermissionConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Resource).NotNull().NotEmpty().MaximumLength(PermissionConst.RESOURCE_MAX_LENGTH);
            RuleFor(x => x.Action).NotNull().NotEmpty().MaximumLength(PermissionConst.ACTION_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(PermissionConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
        }
    }
}
