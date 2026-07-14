using _66SMS.Application.DTOs.Wards;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CommonService.Wards.Queries.GetAllWardsByProvince
{
    public class GetAllWardsByProvinceHandler : IRequestHandler<GetAllWardsByProvinceQuery, Result<List<WardDto>>>
    {
        private readonly IWardSqlRepository wardRepository;
        private readonly ICacheService cacheService;

        public GetAllWardsByProvinceHandler(
            IWardSqlRepository wardRepository,
            ICacheService cacheService)
        {
            this.wardRepository = wardRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<List<WardDto>>> Handle(GetAllWardsByProvinceQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = WardConst.CacheKeyByProvince(request.ProvinceCode);
            var cached = await cacheService.GetAsync<List<WardDto>>(cacheKey, cancellationToken);
            if (cached is not null)
            {
                return Result<List<WardDto>>.Success(cached);
            }

            var list = await wardRepository.AsQueryable()
                .Where(x => x.ProvinceCode == request.ProvinceCode)
                .OrderBy(x => x.Name)
                .Select(x => new WardDto
                {
                    Code = x.Id,
                    Name = x.Name,
                    FullName = x.FullName,
                    ProvinceCode = x.ProvinceCode,
                })
                .ToListAsync(cancellationToken);

            await cacheService.SetAsync(cacheKey, list, WardConst.CACHE_TTL, cancellationToken);
            return Result<List<WardDto>>.Success(list);
        }
    }
}
