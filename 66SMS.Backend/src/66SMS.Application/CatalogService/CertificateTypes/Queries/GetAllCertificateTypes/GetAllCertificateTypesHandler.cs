using _66SMS.Application.DTOs.Certificates;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.CatalogService.CertificateTypes.Queries.GetAllCertificateTypes
{
    public class GetAllCertificateTypesHandler : IRequestHandler<GetAllCertificateTypesQuery, Result<PagedResult<CertificateTypeDTO>>>
    {
        private readonly ICertificateTypeSqlRepository certificateTypeRepository;

        public GetAllCertificateTypesHandler(ICertificateTypeSqlRepository certificateTypeRepository)
        {
            this.certificateTypeRepository = certificateTypeRepository;
        }

        public async Task<Result<PagedResult<CertificateTypeDTO>>> Handle(GetAllCertificateTypesQuery request, CancellationToken cancellationToken)
        {
            var query = certificateTypeRepository.AsQueryable()
                .Where(x => x.Status != CertificateTypeConst.STATUS_DELETED);

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Name.Contains(request.Filter) || x.Code.Contains(request.Filter));
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            if (!request.IsDeleted)
            {
                query = query.Where(x => x.Status != CertificateTypeConst.STATUS_DELETED);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var result = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<CertificateTypeDTO>>.Success(result);
        }
    }
}
