using FluentValidation;

namespace _66SMS.Application.CatalogService.StaffCertificates.Commands.DeleteStaffCertificateMultiples
{
    public class DeleteStaffCertificateMultiplesValidator : AbstractValidator<DeleteStaffCertificateMultiplesCommand>
    {
        public DeleteStaffCertificateMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
