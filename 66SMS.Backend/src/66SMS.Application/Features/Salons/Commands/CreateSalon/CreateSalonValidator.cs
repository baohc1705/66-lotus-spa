using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.Features.Salons.Commands.CreateSalon
{
    public class CreateSalonValidator : AbstractValidator<CreateSalonCommand>
    {
        public CreateSalonValidator()
        {
            RuleFor(x => x.Code).NotEmpty().MaximumLength(SalonConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotEmpty().MaximumLength(SalonConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Phone).NotEmpty().MaximumLength(SalonConst.PHONE_MAX_LENGTH);
            RuleFor(x => x.Email).MaximumLength(SalonConst.EMAIL_MAX_LENGTH).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.StreetAddress).MaximumLength(SalonConst.STREET_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.StreetAddress));
            RuleFor(x => x.FullAddress).MaximumLength(SalonConst.FULL_ADDRESS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.FullAddress));
            RuleFor(x => x.ProvinceCode).MaximumLength(SalonConst.PROVINCE_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.ProvinceCode));
            RuleFor(x => x.WardCode).MaximumLength(SalonConst.WARD_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WardCode));
            RuleFor(x => x.WorkingDays).MaximumLength(SalonConst.WORKING_DAYS_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.WorkingDays));
            RuleFor(x => x.TaxCode).MaximumLength(SalonConst.TAX_CODE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.TaxCode));
        }
    }
}
