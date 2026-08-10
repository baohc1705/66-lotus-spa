using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.UpdateCertificateType
{
    public class UpdateCertificateTypeValidator : AbstractValidator<UpdateCertificateTypeCommand>
    {
        public UpdateCertificateTypeValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
            RuleFor(x => x.Code).NotNull().NotEmpty().MaximumLength(CertificateTypeConst.CODE_MAX_LENGTH);
            RuleFor(x => x.Name).NotNull().NotEmpty().MaximumLength(CertificateTypeConst.NAME_MAX_LENGTH);
            RuleFor(x => x.Description).MaximumLength(CertificateTypeConst.DESCRIPTION_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Description));
        }
    }
}
