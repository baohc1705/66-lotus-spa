using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.StaffCertificates.Queries.GetAllStaffCertificates
{
    public class GetAllStaffCertificatesHandler : IRequestHandler<GetAllStaffCertificatesQuery, Result<PagedResult<StaffCertificateDTO>>>
    {
        private readonly IStaffCertificateSqlRepository staffCertificateRepository;

        public GetAllStaffCertificatesHandler(IStaffCertificateSqlRepository staffCertificateRepository)
        {
            this.staffCertificateRepository = staffCertificateRepository;
        }

        public async Task<Result<PagedResult<StaffCertificateDTO>>> Handle(GetAllStaffCertificatesQuery request, CancellationToken cancellationToken)
        {
            var query = staffCertificateRepository.AsQueryable()
                .Include(x => x.Staff)
                .Include(x => x.CertificateType)
                .Where(x => x.Status != StaffCertificateConst.STATUS_DELETED);

            if (request.StaffId.HasValue)
            {
                query = query.Where(x => x.StaffId == request.StaffId);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.CertificateName.Contains(request.Filter) || x.IssuingOrganization.Contains(request.Filter));
            }

            if (request.ExpiringInDays.HasValue)
            {
                var deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(request.ExpiringInDays.Value));
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                query = query.Where(x => x.ExpiryDate != null && x.ExpiryDate >= today && x.ExpiryDate <= deadline);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "expiry" => request.IsDescending ? query.OrderByDescending(x => x.ExpiryDate) : query.OrderBy(x => x.ExpiryDate),
                "issued" => request.IsDescending ? query.OrderByDescending(x => x.IssuedDate) : query.OrderBy(x => x.IssuedDate),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var result = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<StaffCertificateDTO>>.Success(result);
        }
    }
}
