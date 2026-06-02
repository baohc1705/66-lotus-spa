using _66SMS.Contracts.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Auth.Commands.ResetPassword
{
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Email).NotNull().NotEmpty().Matches(RegexConst.EMAIL_REGEX);
            RuleFor(x => x.Token).NotNull().NotEmpty();
            RuleFor(x => x.NewPassword).NotNull().NotEmpty().Matches(RegexConst.PASSWORD_REGEX);
            RuleFor(x => x.ConfirmPassword).NotNull().NotEmpty().Equal(x => x.NewPassword);
        }
    }
}
