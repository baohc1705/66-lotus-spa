using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerValidator()
        {

            RuleFor(x => x.UserId).GreaterThan(0);
            RuleFor(x => x.FullName).NotNull().NotEmpty().MaximumLength(CustomerConst.FULLNAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.UserName).NotEmpty().MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX);
            RuleFor(x => x.Email).NotEmpty().MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX);
            RuleFor(x => x.Password).NotEmpty().Matches(RegexConst.PASSWORD_REGEX);
            RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.Password);

            RuleFor(x => x.Image) .MaximumLength(CustomerConst.AVATAR_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Image));
            RuleFor(x => x.Dob).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.Dob.HasValue);
            RuleFor(x => x.Gender) .GreaterThan(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.Tier).MaximumLength(CustomerConst.TIER_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Tier));
            RuleFor(x => x.LoyaltyPoint).GreaterThanOrEqualTo(0).When(x => x.LoyaltyPoint.HasValue);
            RuleFor(x => x.Note).MaximumLength(CustomerConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
            RuleFor(x => x.Source).MaximumLength(CustomerConst.SOURCE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Source));
            RuleFor(x => x.StreetAddress).MaximumLength(CustomerConst.STREET_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
        }
    }
}
