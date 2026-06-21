using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.Logout
{
    /// <summary>
    /// Validator for <see cref="LogoutCommand"/>
    /// </summary>
    public class LogoutValidator : AbstractValidator<LogoutCommand>
    {
        public LogoutValidator()
        {
            RuleFor(x => x.Token).NotNull().NotEmpty();
        }
    }
}
