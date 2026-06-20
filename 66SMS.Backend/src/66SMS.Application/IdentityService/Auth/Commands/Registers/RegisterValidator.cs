using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Auth.Commands.Registers
{
    /// <summary>
    /// Validator for <see cref="RegisterCommand"/>
    /// </summary>
    public class RegisterValidator : AbstractValidator<RegisterCommand>  
    {
        public RegisterValidator()
        {
            RuleFor(x => x.FullName).NotNull().MaximumLength(CustomerConst.FULL_NAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotNull().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.UserName).NotNull().Matches(RegexConst.USERNAME_REGEX).MaximumLength(UserConst.USERNAME_MAX_LENGTH);
            RuleFor(x => x.Password).NotNull().Matches(RegexConst.PASSWORD_REGEX);
            RuleFor(x => x.ConfirmPassword).NotNull().Equal(x => x.Password);
        }
    }
}
