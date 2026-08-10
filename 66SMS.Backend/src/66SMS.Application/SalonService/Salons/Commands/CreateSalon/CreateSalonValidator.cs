using _66SMS.Contract.Constants;
using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.SalonService.Salons.Commands.CreateSalon
{
    /// <summary>
    /// validator for <see cref="CreateSalonCommand"/>
    /// </summary>
    public class CreateSalonValidator : AbstractValidator<CreateSalonCommand>
    {
        public CreateSalonValidator()
        {
            RuleFor(x => x.Name).MaximumLength(SalonConst.NAME_MAX_LENGTH).When(x => x.Name != null);
            RuleFor(x => x.Phone).NotNull().Matches(RegexConst.VIETNAM_PHONE_REGEX).MaximumLength(SalonConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.Email).NotNull().Matches(RegexConst.EMAIL_REGEX).MaximumLength(SalonConst.EMAIL_MAX_LENGTH);
            RuleFor(x => x.StreetAddress).MaximumLength(SalonConst.STREET_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(SalonConst.PROVINCE_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(SalonConst.WARD_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
            RuleFor(x => x.WorkingDays).MaximumLength(SalonConst.WORKING_DAYS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WorkingDays));
            RuleFor(x => x.TaxCode).MaximumLength(SalonConst.TAX_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.TaxCode));
        }
    }
}
