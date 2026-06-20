using _66SMS.Application.DTOs.Salons;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.SalonService.Salons.Queries.GetAllSalons
{
    public class GetAllSalonsHandler : IRequestHandler<GetAllSalonsQuery, Result<PagedResult<SalonDto>>>
    {
        private readonly ISalonSqlRepository salonSqlRepository;
        private readonly IMapper mapper;

        public GetAllSalonsHandler(ISalonSqlRepository salonSqlRepository, IMapper mapper)
        {
            this.salonSqlRepository = salonSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<SalonDto>>> Handle(GetAllSalonsQuery request, CancellationToken cancellationToken)
        {
            var query = salonSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                string keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower)
                    || x.Code.ToLower().Contains(keywordLower)
                    || x.Phone.Contains(request.Keyword));
            }

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            PagedResult<SalonDto> result = await query
                .ProjectTo<SalonDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<SalonDto>>.Success(result);
        }
    }
}
