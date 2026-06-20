using _66SMS.Contracts.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.ForgotPassword
{
    public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordCommand>
    {
        public ForgotPasswordValidator()
        {
            RuleFor(x => x.Email).NotNull().NotEmpty().Matches(RegexConst.EMAIL_REGEX);
        }
    }
}
