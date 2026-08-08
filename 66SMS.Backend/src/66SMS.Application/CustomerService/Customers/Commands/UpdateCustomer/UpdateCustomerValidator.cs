using _66SMS.Contract.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;
using _66SMS.Contract.Helpers;

namespace _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer
{
    /// <summary>
    /// validator for <see cref="UpdateCustomerCommand"/>
    /// </summary>
    public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerCommand>
    {
        public UpdateCustomerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.FullName).MaximumLength(CustomerConst.FULL_NAME_MAX_LENGTH).When(x => x.FullName != null);
            RuleFor(x => x.AvatarUrl).MaximumLength(CustomerConst.AVATAR_URL_MAX_LENGTH).When(x => x.AvatarUrl != null);
            RuleFor(x => x.DateOfBirth).LessThan(DateTimeHelper.UtcNow().ToDateOnly()).When(x => x.DateOfBirth.HasValue);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.Phone).Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH).When(x => x.Phone != null);
            RuleFor(x => x.LoyaltyPoint).GreaterThanOrEqualTo(0).When(x => x.LoyaltyPoint.HasValue);
            RuleFor(x => x.FirstPurchaseAt).LessThanOrEqualTo(DateTimeHelper.UtcNow()).When(x => x.FirstPurchaseAt.HasValue);
            RuleFor(x => x.LastPurchaseAt).GreaterThanOrEqualTo(x => x.FirstPurchaseAt).When(x => x.LastPurchaseAt.HasValue && x.FirstPurchaseAt.HasValue);
            RuleFor(x => x.Source).MaximumLength(CustomerConst.SOURCE_MAX_LENGTH).When(x => x.Source != null);
            RuleFor(x => x.Status).GreaterThanOrEqualTo(0).When(x => x.Status.HasValue);
            RuleFor(x => x.Note).MaximumLength(CustomerConst.NOTE_MAX_LENGTH).When(x => x.Note != null);
            RuleFor(x => x.StreetAddress).MaximumLength(CustomerConst.STREET_ADDRESS_MAX_LENGTH).When(x => x.StreetAddress != null);
            RuleFor(x => x.ProvinceCode).MaximumLength(CustomerConst.PROVINCE_CODE_MAX_LENGTH).When(x => x.ProvinceCode != null);
            RuleFor(x => x.WardCode).MaximumLength(CustomerConst.WARD_CODE_MAX_LENGTH).When(x => x.WardCode != null);
            RuleFor(x => x.FullAddress).MaximumLength(CustomerConst.FULL_ADDRESS_MAX_LENGTH).When(x => x.FullAddress != null);
        }
    }
}
