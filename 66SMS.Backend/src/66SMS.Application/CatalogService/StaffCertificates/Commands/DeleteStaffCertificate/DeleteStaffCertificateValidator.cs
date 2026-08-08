using FluentValidation;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificate
{
    public class DeleteStaffCertificateValidator : AbstractValidator<DeleteStaffCertificateCommand>
    {
        public DeleteStaffCertificateValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
