using FluentValidation;

namespace _66SMS.Application.IdentityService.Users.Commands.UpdateUser
{
    /// <summary>
    /// Validator for <see cref="UpdateUserCommand"/>
    /// </summary>
    public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
