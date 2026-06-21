using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.RefreshTokens
{
    /// <summary>
    /// Validator for <see cref="RefreshTokenCommand"/>
    /// </summary>
    public class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenValidator()
        {
            RuleFor(x => x.Token).NotNull().NotEmpty();
        }
    }
}
