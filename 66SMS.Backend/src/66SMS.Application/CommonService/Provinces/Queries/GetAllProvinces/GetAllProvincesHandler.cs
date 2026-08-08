using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CommonService.Provinces.Queries.GetAllProvinces
{
    public class GetAllProvincesHandler : IRequestHandler<GetAllProvincesQuery, Result<List<ProvinceDto>>>
    {
        private readonly IProvinceSqlRepository provinceRepository;
        private readonly ICacheService cacheService;

        public GetAllProvincesHandler(
            IProvinceSqlRepository provinceRepository,
            ICacheService cacheService)
        {
            this.provinceRepository = provinceRepository;
            this.cacheService = cacheService;
        }

        public async Task<Result<List<ProvinceDto>>> Handle(GetAllProvincesQuery request, CancellationToken cancellationToken)
        {
            var cached = await cacheService.GetAsync<List<ProvinceDto>>(ProvinceConst.CACHE_KEY_ALL, cancellationToken);
            if (cached is not null)
            {
                return Result<List<ProvinceDto>>.Success(cached);
            }

            var list = await provinceRepository.AsQueryable()
                .OrderBy(x => x.Name)
                .Select(x => new ProvinceDto
                {
                    Code = x.Id,
                    Name = x.Name,
                    FullName = x.FullName,
                })
                .ToListAsync(cancellationToken);

            await cacheService.SetAsync(ProvinceConst.CACHE_KEY_ALL, list, ProvinceConst.CACHE_TTL, cancellationToken);
            return Result<List<ProvinceDto>>.Success(list);
        }
    }
}
