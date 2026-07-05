using _66SMS.Application.DTOs.Provinces;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CommonService.Provinces.Queries.GetAllProvinces
{
    public class GetAllProvincesHandler : IRequestHandler<GetAllProvincesQuery, Result<List<ProvinceDto>>>
    {
        private readonly IProvinceSqlRepository provinceRepository;
        private readonly IMapper mapper;

        public GetAllProvincesHandler(IProvinceSqlRepository provinceRepository, IMapper mapper)
        {
            this.provinceRepository = provinceRepository;
            this.mapper = mapper;
        }

        public async Task<Result<List<ProvinceDto>>> Handle(GetAllProvincesQuery request, CancellationToken cancellationToken)
        {
            var list = await provinceRepository.AsQueryable()
                .OrderBy(x => x.Name)
                .Select(x => new ProvinceDto{
                    Code = x.Id,
                    Name = x.Name,
                    FullName = x.FullName,
                })
                .ToListAsync(cancellationToken);

            return Result<List<ProvinceDto>>.Success(list);
        }
    }
}
