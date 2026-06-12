using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;
using System;

namespace _66SMS.Application.Features.Staffs.Commands.UpdateStaff
{
    public class UpdateStaffValidator : AbstractValidator<UpdateStaffCommand>
    {
        public UpdateStaffValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.FullName).MaximumLength(StaffConst.FULL_NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullName));
            RuleFor(x => x.Phone).Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(StaffConst.PHONE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Phone));
            RuleFor(x => x.UserName).MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX).When(x => !string.IsNullOrEmpty(x.UserName));
            RuleFor(x => x.Email).MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX).When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.AvatarUrl).MaximumLength(StaffConst.AVATAR_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.AvatarUrl));
            RuleFor(x => x.DateOfBirth).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.DateOfBirth.HasValue);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.NationalId).MaximumLength(StaffConst.NATIONAL_ID_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.NationalId));
            RuleFor(x => x.ContractType).MaximumLength(StaffConst.CONTRACT_TYPE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ContractType));
            RuleFor(x => x.BasicSalary).GreaterThanOrEqualTo(0).When(x => x.BasicSalary.HasValue);
            RuleFor(x => x.Status).GreaterThanOrEqualTo(0).When(x => x.Status.HasValue);
            RuleFor(x => x.StreetAddress).MaximumLength(StaffConst.STREET_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(StaffConst.PROVINCE_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(StaffConst.WARD_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
            RuleFor(x => x.FullAddress).MaximumLength(StaffConst.FULL_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullAddress));
        }
    }
}
