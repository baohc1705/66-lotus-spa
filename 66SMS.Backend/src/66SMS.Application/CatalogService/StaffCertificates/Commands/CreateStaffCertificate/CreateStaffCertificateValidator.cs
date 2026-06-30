using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.CreateStaffCertificate
{
    public class CreateStaffCertificateValidator : AbstractValidator<CreateStaffCertificateCommand>
    {
        public CreateStaffCertificateValidator()
        {
            RuleFor(x => x.StaffId).NotNull().GreaterThan(0);
            RuleFor(x => x.CertificateTypeId).NotNull().GreaterThan(0);
            RuleFor(x => x.CertificateName).NotNull().NotEmpty().MaximumLength(StaffCertificateConst.CERTIFICATE_NAME_MAX_LENGTH);
            RuleFor(x => x.IssuingOrganization).NotNull().NotEmpty().MaximumLength(StaffCertificateConst.ISSUING_ORGANIZATION_MAX_LENGTH);
            RuleFor(x => x.IssuedDate).NotNull().NotEmpty();
            RuleFor(x => x.CertificateNumber).MaximumLength(StaffCertificateConst.CERTIFICATE_NUMBER_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.CertificateNumber));
            RuleFor(x => x.DocumentUrl).MaximumLength(StaffCertificateConst.DOCUMENT_URL_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.DocumentUrl));
            RuleFor(x => x.Note).MaximumLength(StaffCertificateConst.NOTE_MAX_LENGTH).When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
