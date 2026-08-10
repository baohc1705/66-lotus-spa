using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.CatalogService.Services.Queries.GetAllServices
{
    public class GetAllServicesHandler : IRequestHandler<GetAllServicesQuery, Result<PagedResult<ServiceDto>>>
    {
        private readonly IServiceSqlRepository serviceSqlRepository;
        private readonly ICacheService cacheService;

        public GetAllServicesHandler(
            IServiceSqlRepository serviceSqlRepository,
            ICacheService cacheService)
        {
            this.serviceSqlRepository = serviceSqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<ServiceDto>>> Handle(GetAllServicesQuery request, CancellationToken cancellationToken)
        {
            var filterHash = CacheKeyHash.FromObject(new
            {
                request.CategoryId,
                request.Status,
                request.Keyword,
                request.MinPrice,
                request.MaxPrice,
                request.IsDeleted,
                request.PageIndex,
                request.PageSize,
                request.OrderBy,
                request.IsDescending,
            });
            var cacheKey = ServiceConst.CacheKeyList(filterHash);

            var cached = await cacheService.GetAsync<PagedResult<ServiceDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<PagedResult<ServiceDto>>.Success(cached);
            }

            var query = serviceSqlRepository.AsQueryable();
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

            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "category" => request.IsDescending ? query.OrderByDescending(x => x.CategoryId) : query.OrderBy(x => x.CategoryId),
                "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            };

            PagedResult<ServiceDto> pagedResult = await query
                .Select(x => new ServiceDto
                {
                    Id = x.Id,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category!.Name,
                    Code = x.Code,
                    Name = x.Name,
                    DurationMins = x.DurationMins,
                    SellingPrice = x.SellingPrice,
                    Status = x.Status,
                    ImageUrl = x.ImageUrl,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .ToPagedAsync(request, cancellationToken);

            await cacheService.SetAsync(cacheKey, pagedResult, ServiceConst.CACHE_TTL_LIST, cancellationToken);
            return Result<PagedResult<ServiceDto>>.Success(pagedResult);
        }
    }
}
