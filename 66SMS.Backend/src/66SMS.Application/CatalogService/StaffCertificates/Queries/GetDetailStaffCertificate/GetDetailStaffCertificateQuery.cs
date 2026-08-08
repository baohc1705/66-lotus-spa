using _66SMS.Application.DTOs;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.CatalogService.StaffCertificates.Queries.GetDetailStaffCertificate
{
    public class GetDetailStaffCertificateQuery : IRequest<Result<StaffCertificateDTO>>
    {
        public int? Id { get; set; }
    }
}
