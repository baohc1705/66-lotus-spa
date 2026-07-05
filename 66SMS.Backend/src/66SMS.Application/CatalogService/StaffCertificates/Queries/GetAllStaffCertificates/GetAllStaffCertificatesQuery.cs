using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.StaffCertificates.Queries.GetAllStaffCertificates
{
    public class GetAllStaffCertificatesQuery : PageRequest, IRequest<Result<PagedResult<StaffCertificateDTO>>>
    {
        public int? StaffId { get; set; }
        public int? Status { get; set; }
        public int? ExpiringInDays { get; set; }
        public int? CertificateTypeId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
