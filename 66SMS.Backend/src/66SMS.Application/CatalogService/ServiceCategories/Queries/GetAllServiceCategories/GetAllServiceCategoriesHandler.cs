using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Enums;
using MediatR;

namespace _66SMS.Application.CatalogService.ServiceCategories.Queries.GetAllServiceCategories
{
    public class GetAllServiceCategoriesHandler : IRequestHandler<GetAllServiceCategoriesQuery, Result<PagedResult<ServiceCategoryDto>>>
    {
        private readonly IServiceCategorySqlRepository serviceCategorySqlRepository;
        private readonly ICacheService cacheService;

        public GetAllServiceCategoriesHandler(
            IServiceCategorySqlRepository serviceCategorySqlRepository,
            ICacheService cacheService)
        {
            this.serviceCategorySqlRepository = serviceCategorySqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<ServiceCategoryDto>>> Handle(GetAllServiceCategoriesQuery request, CancellationToken cancellationToken)
        {
            var filterHash = CacheKeyHash.FromObject(new
            {
                request.Keyword,
                request.Status,
                request.IsDeleted,
                request.PageIndex,
                request.PageSize,
                request.OrderBy,
                request.IsDescending,
            });
            var cacheKey = ServiceCategoryConst.CacheKeyList(filterHash);
            var cached = await cacheService.GetAsync<PagedResult<ServiceCategoryDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<PagedResult<ServiceCategoryDto>>.Success(cached);
            }

            var query = serviceCategorySqlRepository.AsQueryable(true);

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.Name.StartsWith(request.Keyword));
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

            query = request.OrderBy?.Trim().ToLower() switch
            {
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.Id) : query.OrderBy(x => x.Id)
            };

            PagedResult<ServiceCategoryDto> result = await query
                .Select(x => new ServiceCategoryDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    SortOrder = x.SortOrder,
                    Status = x.Status,
                    Icon = x.Icon,
                    ImageUrl = x.ImageUrl,
                })
                .ToPagedAsync(request, cancellationToken);

            await cacheService.SetAsync(cacheKey, result, ServiceCategoryConst.CACHE_TTL, cancellationToken);
            return Result<PagedResult<ServiceCategoryDto>>.Success(result);
        }
    }
}
