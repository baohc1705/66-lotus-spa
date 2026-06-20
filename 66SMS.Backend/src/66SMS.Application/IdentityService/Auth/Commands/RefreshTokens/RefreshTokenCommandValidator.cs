using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(x => x.Token).NotNull().NotEmpty();
        }
    }
}
