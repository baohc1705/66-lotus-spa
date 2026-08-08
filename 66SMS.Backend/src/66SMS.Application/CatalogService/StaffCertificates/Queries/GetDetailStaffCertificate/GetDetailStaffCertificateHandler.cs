using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.StaffCertificates.Queries.GetDetailStaffCertificate
{
    public class GetDetailStaffCertificateHandler : IRequestHandler<GetDetailStaffCertificateQuery, Result<StaffCertificateDTO>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;

        public GetDetailStaffCertificateHandler(IStaffCertificateSqlRepository staffCertificateRepository)
        {
            this.staffCertificateRepository = staffCertificateRepository;
        }

        public async Task<Result<StaffCertificateDTO>> Handle(GetDetailStaffCertificateQuery request, CancellationToken cancellationToken)
        {
            var item = await staffCertificateRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != StaffCertificateConst.STATUS_DELETED)
                .Select(x => new StaffCertificateDTO
                {
                    Id = x.Id,
                    StaffId = x.StaffId,
                    StaffName = x.Staff != null ? x.Staff.FullName : null,
                    CertificateTypeId = x.CertificateTypeId,
                    TypeName = x.CertificateType != null ? x.CertificateType.Name : null,
                    CertificateName = x.CertificateName,
                    CertificateNumber = x.CertificateNumber,
                    IssuingOrganization = x.IssuingOrganization,
                    IssuedDate = x.IssuedDate.ToString(),
                    ExpiryDate = x.ExpiryDate != null ? x.ExpiryDate.ToString() : null,
                    DocumentUrl = x.DocumentUrl,
                    Note = x.Note,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    UpdatedAt = x.UpdatedAt.ToString(),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (item == null)
                return Result<StaffCertificateDTO>.NotFound(StaffCertificateConst.MSG_NOT_FOUND, ErrorCodes.ERR_STAFF_CERTIFICATE_NOT_FOUND);

            return Result<StaffCertificateDTO>.Success(item);
        }
    }
}
