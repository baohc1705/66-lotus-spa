using _66SMS.Application.DTOs.Wards;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Wards.Queries.GetAllWardsByProvince
{
    public class GetAllWardsByProvinceHandler : IRequestHandler<GetAllWardsByProvinceQuery, Result<List<WardDto>>>
    {
        private readonly IWardSqlRepository _wardRepository;
        private readonly IMapper _mapper;

        public GetAllWardsByProvinceHandler(IWardSqlRepository wardRepository, IMapper mapper)
        {
            _wardRepository = wardRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<WardDto>>> Handle(GetAllWardsByProvinceQuery request, CancellationToken cancellationToken)
        {
            var list = await _wardRepository.AsQueryable()
                .Where(x => x.ProvinceCode == request.ProvinceCode)
                .OrderBy(x => x.Name)
                .ProjectTo<WardDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<WardDto>>.Success(list);
        }
    }
}
