using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CatalogService.CertificateTypes.Queries.GetDetailCertificateType
{
    public class GetDetailCertificateTypeHandler : IRequestHandler<GetDetailCertificateTypeQuery, Result<CertificateTypeDTO>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;

        public GetDetailCertificateTypeHandler(ICertificateTypeSqlRepository certificateTypeRepository)
        {
            this.certificateTypeRepository = certificateTypeRepository;
        }

        public async Task<Result<CertificateTypeDTO>> Handle(GetDetailCertificateTypeQuery request, CancellationToken cancellationToken)
        {
            var item = await certificateTypeRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != CertificateTypeConst.STATUS_DELETED)
                .Select(x => new CertificateTypeDTO
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt.ToString(),
                    CreatedBy = x.CreatedBy,
                    UpdatedAt = x.UpdatedAt.ToString(),
                    UpdatedBy = x.UpdatedBy,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (item == null)
                return Result<CertificateTypeDTO>.NotFound(CertificateTypeConst.MSG_NOT_FOUND, ErrorCodes.ERR_CERTIFICATE_TYPE_NOT_FOUND);

            return Result<CertificateTypeDTO>.Success(item);
        }
    }
}
