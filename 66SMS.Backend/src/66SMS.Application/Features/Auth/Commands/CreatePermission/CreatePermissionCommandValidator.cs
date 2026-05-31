using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Auth.Commands.CreatePermission
{
    public class CreatePermissionCommandValidator : AbstractValidator<CreatePermissionCommand>
    {
        public CreatePermissionCommandValidator()
        {
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(PermissionConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Resource).NotNull().NotEmpty().MaximumLength(PermissionConst.RESOURCE_MAX_LENGTH);
            RuleFor(x => x.Action).NotNull().NotEmpty().MaximumLength(PermissionConst.ACTION_MAX_LENGTH);
            RuleFor(x => x.Description).NotNull().NotEmpty().MaximumLength(PermissionConst.DESCRIPTION_MAX_LENGTH);
        }
    }
}
