using _66SMS.Contract.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CustomerService.Customers.Commands.CreateCustomer
{
    /// <summary>
    /// Validator for <see cref="CreateCustomerCommand"/>
    /// </summary>
    public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerValidator()
        {

            RuleFor(x => x.FullName).NotNull().NotEmpty().MaximumLength(CustomerConst.FULL_NAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotNull().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.Email).NotNull().NotEmpty().Matches(RegexConst.EMAIL_REGEX).MaximumLength(UserConst.EMAIL_MAX_LENGTH);

            RuleFor(x => x.AvatarUrl).MaximumLength(CustomerConst.AVATAR_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.AvatarUrl));
            RuleFor(x => x.DateOfBirth).LessThan(DateTimeHelper.UtcNow().ToDateOnly()).When(x => x.DateOfBirth.HasValue);
            RuleFor(x => x.Gender) .GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
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
