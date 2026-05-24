using FluentValidation;

namespace _66SMS.Application.Features.Auth.Commands.Logout
{
    public class LogoutComandValidator : AbstractValidator<LogoutCommand>
    {
        public LogoutComandValidator()
        {
            RuleFor(x => x.Token).NotNull().NotEmpty();
        }
    }
}
