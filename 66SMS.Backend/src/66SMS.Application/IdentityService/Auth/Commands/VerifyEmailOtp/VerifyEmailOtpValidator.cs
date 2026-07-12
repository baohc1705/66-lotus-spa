using System.Text.RegularExpressions;
using FluentValidation;
using _66SMS.Contracts.Constants;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    public class VerifyEmailOtpValidator : AbstractValidator<VerifyEmailOtpCommand>
    {
        public VerifyEmailOtpValidator()
        {
            RuleFor(x => x.Email).NotNull().Matches(RegexConst.EMAIL_REGEX).NotEmpty();
            RuleFor(x => x.OtpCode).NotNull().NotEmpty().Length(6);
        }
    }
}
