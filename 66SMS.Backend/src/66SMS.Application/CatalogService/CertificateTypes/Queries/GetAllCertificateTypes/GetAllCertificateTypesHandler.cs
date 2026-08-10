using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
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
            var query = certificateTypeRepository.AsQueryable();

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.Name.Contains(request.Filter) || x.Code.Contains(request.Filter));
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status);
            }

            query = request.OrderBy?.ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
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
                    CreatedAt = null,
                    CreatedBy = null,
                    UpdatedAt = null,
                    UpdatedBy = null,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<CertificateTypeDTO>>.Success(result);
        }
    }
}
