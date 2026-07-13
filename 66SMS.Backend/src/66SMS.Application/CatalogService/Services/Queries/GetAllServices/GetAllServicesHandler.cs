using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Enums;
using MediatR;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesHandler : IRequestHandler<GetAllServicesQuery, Result<PagedResult<ServiceListDto>>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;

        public GetAllServicesHandler(IServiceSqlRepository serviceSqlRepository)
        {
            this.serviceSqlRepository = serviceSqlRepository;
        }

        public async Task<Result<PagedResult<ServiceListDto>>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
        {
            var query = serviceSqlRepository.AsQueryable();
            // Filter here
            if (request.CategoryId.HasValue)
            {
                query = query.Where(x => x.CategoryId == request.CategoryId);
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.Name.StartsWith(request.Keyword) || x.Code == request.Keyword);
            }

            if (request.IsDeleted)
            {
                query = query.Where(x => x.Status == (int)StatusActiveEnum.DELETED);
            }
            else
            {
                query = query.Where(x => x.Status != (int)StatusActiveEnum.DELETED);
            }

            if (request.Status != null)
            {
                query = query.Where(x => x.Status == request.Status);
            }


            if (request.MinPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice >= request.MinPrice);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(x => x.SellingPrice <= request.MaxPrice);
            }

            // Order by
            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "category" => request.IsDescending ? query.OrderByDescending(x => x.CategoryId) : query.OrderBy(x => x.CategoryId),
                "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            };

            PagedResult<ServiceListDto> pagedResult = await query
                .Select(x => new ServiceListDto
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category!.Name,
                    Code = x.Code,
                    Name = x.Name,
                    DurationMins = x.DurationMins,
                    CostPrice = x.CostPrice,
                    SellingPrice = x.SellingPrice,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    ImageUrl = x.ImageUrl
                })
                .ToPagedAsync(request, cancellationToken);
            return Result<PagedResult<ServiceListDto>>.Success(pagedResult);
        }
    }
}
