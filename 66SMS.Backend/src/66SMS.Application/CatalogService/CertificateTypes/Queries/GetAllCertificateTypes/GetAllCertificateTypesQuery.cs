using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.CertificateTypes.Queries.GetAllCertificateTypes
{
    public class GetAllCertificateTypesQuery : PageRequest, IRequest<Result<PagedResult<CertificateTypeDTO>>>
    {
        public int? Status { get; set; }
        public bool IsDeleted { get; set; } = true;
    }
}
