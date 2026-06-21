using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.Login
{
    /// <summary>
    /// Validator for <see cref="LoginCommand"/>
    /// </summary>
    public class LoginValidator : AbstractValidator<LoginCommand>
    {
        public LoginValidator()
        {
            RuleFor(x => x.UsernameOrEmail).NotNull().MaximumLength(UserConst.EMAIL_MAX_LENGTH);
            RuleFor(x => x.Password).NotNull();
        }
    }
}
