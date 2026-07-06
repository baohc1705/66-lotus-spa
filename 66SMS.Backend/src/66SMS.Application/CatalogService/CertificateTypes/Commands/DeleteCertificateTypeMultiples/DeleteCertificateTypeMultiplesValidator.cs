using FluentValidation;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateTypeMultiples
{
    public class DeleteCertificateTypeMultiplesValidator : AbstractValidator<DeleteCertificateTypeMultiplesCommand>
    {
        public DeleteCertificateTypeMultiplesValidator()
        {
            RuleFor(x => x.Ids).NotEmpty();
            RuleFor(x => x.Ids).Must(x => x.Distinct().Count() == x.Count);
        }
    }
}
