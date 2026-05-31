using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.Features.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerCommand>
    {
        public UpdateCustomerValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(CustomerConst.FULLNAME_MAX_LENGTH).When(x => x.FullName != null);
            RuleFor(x => x.Image).NotEmpty().MaximumLength(CustomerConst.AVATAR_MAX_LENGTH).When(x => x.Image != null);
            RuleFor(x => x.Dob).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.Dob.HasValue);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(CustomerConst.PHONE_MAX_LENGTH).When(x => x.Phone != null);
            RuleFor(x => x.Tier).NotEmpty().MaximumLength(CustomerConst.TIER_MAX_LENGTH).When(x => x.Tier != null);
            RuleFor(x => x.LoyaltyPoint).GreaterThanOrEqualTo(0).When(x => x.LoyaltyPoint.HasValue);
            RuleFor(x => x.FirstPurchaseAt).LessThanOrEqualTo(DateTime.Now).When(x => x.FirstPurchaseAt.HasValue);
            RuleFor(x => x.LastPurchaseAt).GreaterThanOrEqualTo(x => x.FirstPurchaseAt).When(x => x.LastPurchaseAt.HasValue && x.FirstPurchaseAt.HasValue);
            RuleFor(x => x.Source).NotEmpty().MaximumLength(CustomerConst.SOURCE_MAX_LENGTH).When(x => x.Source != null);
            RuleFor(x => x.Status).GreaterThan(0).When(x => x.Status.HasValue);
            RuleFor(x => x.Note).NotEmpty().MaximumLength(CustomerConst.NOTE_MAX_LENGTH).When(x => x.Note != null);
            RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(CustomerConst.STREET_MAX_LENGTH).When(x => x.StreetAddress != null);
            RuleFor(x => x.ProvinceCode).NotEmpty().When(x => x.ProvinceCode != null);
            RuleFor(x => x.WardCode).NotEmpty().When(x => x.WardCode != null);
            RuleFor(x => x.FullAddreess).NotEmpty().When(x => x.FullAddreess != null);
            RuleFor(x => x.UserName).NotEmpty().MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX).When(x => x.UserName != null);
            RuleFor(x => x.Email).NotEmpty().MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX).When(x => x.Email != null);
        }
    }
}