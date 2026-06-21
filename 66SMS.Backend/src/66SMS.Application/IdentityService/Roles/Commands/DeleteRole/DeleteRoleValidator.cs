using FluentValidation;

namespace _66SMS.Application.IdentityService.Roles.Commands.DeleteRole
{
    /// <summary>
    /// Validator for <see cref="DeleteRoleCommand"/>
    /// </summary>
    public class DeleteRoleValidator : AbstractValidator<DeleteRoleCommand>
    {
        public DeleteRoleValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);   
        }
    }
}
