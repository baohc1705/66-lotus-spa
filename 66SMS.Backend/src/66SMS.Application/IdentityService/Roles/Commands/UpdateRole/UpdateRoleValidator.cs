using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.UpdateRole
{
    public class UpdateRoleValidator : AbstractValidator<UpdateRoleCommand>
    {
        public UpdateRoleValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0);
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(RoleConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(RoleConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
        }
    }
}
