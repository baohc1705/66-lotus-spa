using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.VerifyEmailOtp
{
    public class VerifyEmailOtpValidator : AbstractValidator<VerifyEmailOtpCommand>
    {
        public VerifyEmailOtpValidator()
        {
            RuleFor(x => x.Email).NotNull().NotEmpty();
            RuleFor(x => x.OtpCode).NotNull().NotEmpty().Length(6);
        }
    }
}
