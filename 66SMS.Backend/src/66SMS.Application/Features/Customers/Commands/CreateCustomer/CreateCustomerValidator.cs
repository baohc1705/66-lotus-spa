using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerValidator()
        {

            RuleFor(x => x.FullName).NotNull().NotEmpty().MaximumLength(CustomerConst.FULL_NAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.UserName).NotEmpty().MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX);
            RuleFor(x => x.Email).NotEmpty().MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX);
            RuleFor(x => x.Password).NotEmpty().Matches(RegexConst.PASSWORD_REGEX);
            RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.Password);

            RuleFor(x => x.AvatarUrl).MaximumLength(CustomerConst.AVATAR_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.AvatarUrl));
            RuleFor(x => x.DateOfBirth).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.DateOfBirth.HasValue);
            RuleFor(x => x.Gender) .GreaterThan(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.Tier).MaximumLength(CustomerConst.TIER_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Tier));
            RuleFor(x => x.LoyaltyPoint).GreaterThanOrEqualTo(0).When(x => x.LoyaltyPoint.HasValue);
            RuleFor(x => x.Note).MaximumLength(CustomerConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
            RuleFor(x => x.Source).MaximumLength(CustomerConst.SOURCE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Source));
            RuleFor(x => x.StreetAddress).MaximumLength(CustomerConst.STREET_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.FullAddress).MaximumLength(CustomerConst.FULL_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(CustomerConst.PROVINCE_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(CustomerConst.WARD_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
        }
    }
}
