using _66SMS.Contract.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Staffs.Commands.CreateStaff
{
    /// <summary>
    /// Validator for <see cref="CreateStaffCommand"/>
    /// </summary>
    public class CreateStaffValidator : AbstractValidator<CreateStaffCommand>
    {
        public CreateStaffValidator()
        {
            RuleFor(x => x.FullName).NotNull().NotEmpty().MaximumLength(StaffConst.FULL_NAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(StaffConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.NationalId).MaximumLength(StaffConst.NATIONAL_ID_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.NationalId));
            RuleFor(x => x.ContractType).MaximumLength(StaffConst.CONTRACT_TYPE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ContractType));
            RuleFor(x => x.BasicSalary).GreaterThanOrEqualTo(0).When(x => x.BasicSalary.HasValue);
            RuleFor(x => x.Status).GreaterThanOrEqualTo(0).When(x => x.Status.HasValue);
            RuleFor(x => x.StreetAddress).MaximumLength(StaffConst.STREET_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(StaffConst.PROVINCE_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(StaffConst.WARD_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
            RuleFor(x => x.FullAddress).MaximumLength(StaffConst.FULL_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullAddress));
            RuleFor(x => x.Email).Matches(RegexConst.EMAIL_REGEX).When(x => x.Email != null);
        }
    }
}
