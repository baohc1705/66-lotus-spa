using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.CertificateTypes.Queries.GetDetailCertificateType
{
    public class GetDetailCertificateTypeQuery : IRequest<Result<CertificateTypeDTO>>
    {
        public int? Id { get; set; }
    }
}
