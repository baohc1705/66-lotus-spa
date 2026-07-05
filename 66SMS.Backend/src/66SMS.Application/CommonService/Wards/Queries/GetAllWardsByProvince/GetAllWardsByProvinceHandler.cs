using _66SMS.Application.DTOs.Wards;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CommonService.Wards.Queries.GetAllWardsByProvince
{
    public class GetAllWardsByProvinceHandler : IRequestHandler<GetAllWardsByProvinceQuery, Result<List<WardDto>>>
    {
        private readonly IWardSqlRepository wardRepository;

        public GetAllWardsByProvinceHandler(IWardSqlRepository wardRepository)
        {
            this.wardRepository = wardRepository;
        }

        public async Task<Result<List<WardDto>>> Handle(GetAllWardsByProvinceQuery request, CancellationToken cancellationToken)
        {
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

            return Result<List<WardDto>>.Success(list);
        }
    }
}
