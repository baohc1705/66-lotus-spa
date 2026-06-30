using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.CertificateTypes.Commands.DeleteCertificateType
{
    public class DeleteCertificateTypeCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
