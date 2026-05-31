using _66SMS.Contracts.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;
using System;

namespace _66SMS.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeValidator : AbstractValidator<UpdateEmployeeCommand>
    {
        public UpdateEmployeeValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.FullName).NotEmpty().MaximumLength(EmployeeConst.FULLNAME_MAX_LENGTH).When(x => x.FullName != null);
            RuleFor(x => x.Image).NotEmpty().MaximumLength(EmployeeConst.AVATAR_MAX_LENGTH).When(x => x.Image != null);
            RuleFor(x => x.Dob).LessThan(DateOnly.FromDateTime(DateTime.Now)).When(x => x.Dob.HasValue);
            RuleFor(x => x.Gender).GreaterThanOrEqualTo(0).When(x => x.Gender.HasValue);
            RuleFor(x => x.NationalId).NotEmpty().MaximumLength(EmployeeConst.NATIONAL_ID_MAX_LENGTH).When(x => x.NationalId != null);
            RuleFor(x => x.Phone).NotEmpty().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(EmployeeConst.PHONE_MAX_LENGTH).When(x => x.Phone != null);
            RuleFor(x => x.HireDate).LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now)).When(x => x.HireDate.HasValue);
            RuleFor(x => x.ContractType).NotEmpty().MaximumLength(EmployeeConst.CONTRACT_TYPE_MAX_LENGTH).When(x => x.ContractType != null);
            RuleFor(x => x.BasicSalary).GreaterThanOrEqualTo(0).When(x => x.BasicSalary.HasValue);
            RuleFor(x => x.Status).GreaterThanOrEqualTo(0).When(x => x.Status.HasValue);
            RuleFor(x => x.StreetAddress).NotEmpty().MaximumLength(EmployeeConst.STREET_MAX_LENGTH).When(x => x.StreetAddress != null);
            RuleFor(x => x.ProvinceCode).NotEmpty().MaximumLength(EmployeeConst.PROVINCE_MAX_LENGTH).When(x => x.ProvinceCode != null);
            RuleFor(x => x.WardCode).NotEmpty().MaximumLength(EmployeeConst.WARD_MAX_LENGTH).When(x => x.WardCode != null);
            RuleFor(x => x.FullAddress).NotEmpty().MaximumLength(EmployeeConst.FULL_ADDRESS_MAX_LENGTH).When(x => x.FullAddress != null);
            RuleFor(x => x.UserName).NotEmpty().MaximumLength(UserConst.USERNAME_MAX_LENGTH).Matches(RegexConst.USERNAME_REGEX).When(x => x.UserName != null);
            RuleFor(x => x.Email).NotEmpty().MaximumLength(UserConst.EMAIL_MAX_LENGTH).Matches(RegexConst.EMAIL_REGEX).When(x => x.Email != null);
        }
    }
}
