using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsHandler : IRequestHandler<GetAllSalonsQuery, Result<PagedResult<SalonDto>>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly ICacheService cacheService;

        public GetAllSalonsHandler(
            ISalonSqlRepository salonSqlRepository,
            ICacheService cacheService)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<PagedResult<SalonDto>>> Handle(GetAllSalonsQuery request, CancellationToken cancellationToken)
        {
            var filterHash = CacheKeyHash.FromObject(new
            {
                request.Filter,
                request.Status,
                request.IsDeleted,
                request.PageIndex,
                request.PageSize,
                request.OrderBy,
                request.IsDescending,
            });
            var cacheKey = SalonConst.CacheKeyList(filterHash);
            var cached = await cacheService.GetAsync<PagedResult<SalonDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<PagedResult<SalonDto>>.Success(cached);
            }

            var query = salonSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                string keywordLower = request.Filter.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower)
                    || x.Code.ToLower().Contains(keywordLower)
                    || x.Phone.Contains(request.Filter));
            }

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            if (!request.IsDeleted)
            {
                query = query.Where(x => x.Status != SalonConst.STATUS_DELETED);
            }

            query = request.OrderBy switch
            {
                "sortorder" => request.IsDescending ? query.OrderByDescending(x => x.SortOrder) : query.OrderBy(x => x.SortOrder),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            PagedResult<SalonDto> result = await query
                .Select(x => new SalonDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Phone = x.Phone,
                    Email = x.Email,
                    StreetAddress = x.StreetAddress,
                    ProvinceCode = x.ProvinceCode,
                    WardCode = x.WardCode,
                    FullAddress = x.FullAddress,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    WorkingDays = x.WorkingDays,
                    TaxCode = x.TaxCode,
                    ImageUrl = x.ImageUrl,
                    SortOrder = x.SortOrder,
                    IsPrimary = x.IsPrimary,
                    Status = x.Status,
                    CreatedAt = x.CreatedAt
                })
                .ToPagedAsync(request, cancellationToken);

            await cacheService.SetAsync(cacheKey, result, SalonConst.CACHE_TTL_LIST, cancellationToken);
            return Result<PagedResult<SalonDto>>.Success(result);
        }
    }
}
