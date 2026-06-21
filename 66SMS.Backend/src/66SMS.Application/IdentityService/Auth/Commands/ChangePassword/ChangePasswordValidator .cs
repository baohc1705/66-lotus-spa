using _66SMS.Contracts.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.ChangePassword
{
    /// <summary>
    /// Validator for <see cref="ChangePasswordCommand"/>
    /// </summary>
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.CurrentPassword).NotNull().NotEmpty();
            RuleFor(x => x.NewPassword).NotNull().NotEmpty().Matches(RegexConst.PASSWORD_REGEX).NotEqual(x => x.CurrentPassword);
            RuleFor(x => x.ConfirmPassword).NotNull().NotEmpty().Equal(x => x.NewPassword);
        }
    }
}
