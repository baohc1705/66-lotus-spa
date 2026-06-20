using _66SMS.Contracts.Constants;
using FluentValidation;

namespace _66SMS.Application.IdentityService.Users.Commands.UpdateUser
{
    public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
    {
        public UpdateUserValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Username).Matches(RegexConst.USERNAME_REGEX);
            RuleFor(x => x.Email).Matches(RegexConst.EMAIL_REGEX);
        }
    }
}
