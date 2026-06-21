using FluentValidation;
using _66SMS.Domain.Constants;

namespace _66SMS.Application.SalonService.Salons.Commands.UpdateSalon
{
    public class UpdateSalonValidator : AbstractValidator<UpdateSalonCommand>
    {
        public UpdateSalonValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Name).MaximumLength(SalonConst.NAME_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Name));
            RuleFor(x => x.Phone).MaximumLength(SalonConst.PHONE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Phone));
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
