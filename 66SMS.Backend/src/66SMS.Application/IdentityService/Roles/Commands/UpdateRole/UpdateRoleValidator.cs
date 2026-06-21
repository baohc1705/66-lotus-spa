using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.UpdateRole
{
    /// <summary>
    /// Validator for <see cref="UpdateRoleCommand"/>
    /// </summary>
    public class UpdateRoleValidator : AbstractValidator<UpdateRoleCommand>
    {
        public UpdateRoleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(RoleConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.Description).MaximumLength(RoleConst.DESCRIPTION_MAX_LENGTH).When(x => x.Description != null);
        }
    }
}
