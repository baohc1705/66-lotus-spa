using _66SMS.Contract.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.SendEmailOtp
{
    /// <summary>
    /// Validator for <see cref="SendEmailOtpCommand"/>
    /// </summary>
    public class SendEmailOtpValidator : AbstractValidator<SendEmailOtpCommand>
    {
        public SendEmailOtpValidator()
        {
            RuleFor(x => x.Email).NotNull().NotEmpty().Matches(RegexConst.EMAIL_REGEX);
        }
    }
}
