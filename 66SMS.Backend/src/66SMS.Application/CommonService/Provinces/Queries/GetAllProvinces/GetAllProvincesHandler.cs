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
        private readonly IProvinceSqlRepository _provinceRepository;
        private readonly IMapper _mapper;

        public GetAllProvincesHandler(IProvinceSqlRepository provinceRepository, IMapper mapper)
        {
            _provinceRepository = provinceRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<ProvinceDto>>> Handle(GetAllProvincesQuery request, CancellationToken cancellationToken)
        {
            var list = await _provinceRepository.AsQueryable()
                .OrderBy(x => x.Name)
                .ProjectTo<ProvinceDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<ProvinceDto>>.Success(list);
        }
    }
}
