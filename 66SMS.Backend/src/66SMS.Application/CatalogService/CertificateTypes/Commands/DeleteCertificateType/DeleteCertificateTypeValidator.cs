using _66SMS.Domain.Constants;
using FluentValidation;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateType
{
    public class DeleteCertificateTypeValidator : AbstractValidator<DeleteCertificateTypeCommand>
    {
        public DeleteCertificateTypeValidator()
        {
            RuleFor(x => x.Id).NotNull().GreaterThan(0);
        }
    }
}
