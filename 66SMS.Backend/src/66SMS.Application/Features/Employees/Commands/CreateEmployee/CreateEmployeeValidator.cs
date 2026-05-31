using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;
using System;

namespace _66SMS.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeValidator : AbstractValidator<CreateEmployeeCommand>
    {
        public CreateEmployeeValidator()
        {
            RuleFor(x => x.UserId).GreaterThan(0).When(x => x.UserId.HasValue);
            RuleFor(x => x.FullName).NotNull().NotEmpty().MaximumLength(EmployeeConst.FULLNAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(EmployeeConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.UserName).NotEmpty().MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX);
            RuleFor(x => x.Email).NotEmpty().MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX);
            RuleFor(x => x.Password).NotEmpty().Matches(RegexConst.PASSWORD_REGEX);
            RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.Password);

            RuleFor(x => x.Image).MaximumLength(EmployeeConst.AVATAR_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Image));
            RuleFor(x => x.Dob).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.Dob.HasValue);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.NationalId).MaximumLength(EmployeeConst.NATIONAL_ID_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.NationalId));
            RuleFor(x => x.ContractType).MaximumLength(EmployeeConst.CONTRACT_TYPE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ContractType));
            RuleFor(x => x.BasicSalary).GreaterThanOrEqualTo(0).When(x => x.BasicSalary.HasValue);
            RuleFor(x => x.Status).GreaterThanOrEqualTo(0).When(x => x.Status.HasValue);
            RuleFor(x => x.StreetAddress).MaximumLength(EmployeeConst.STREET_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(EmployeeConst.PROVINCE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(EmployeeConst.WARD_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
            RuleFor(x => x.FullAddress).MaximumLength(EmployeeConst.FULL_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullAddress));
        }
    }
}
