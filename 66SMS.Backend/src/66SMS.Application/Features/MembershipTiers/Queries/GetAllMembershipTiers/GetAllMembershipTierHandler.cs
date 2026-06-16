using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;

namespace _66SMS.Application.Features.MembershipTiers.Queries.GetAllMembershipTiers
{
    public class GetAllMembershipTierHandler : IRequestHandler<GetAllMembershipTierQuery, Result<PagedResult<MembershipTierDto>>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly IMapper mapper;

        public GetAllMembershipTierHandler(IMembershipTierSqlRepository membershipTierSqlRepository, IMapper mapper)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<MembershipTierDto>>> Handle(GetAllMembershipTierQuery request, CancellationToken cancellationToken)
        {
            var query = membershipTierSqlRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower));
            }

            PagedResult<MembershipTierDto> result = await query
                .ProjectTo<MembershipTierDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<MembershipTierDto>>.Success(result);
        }
    }
}
