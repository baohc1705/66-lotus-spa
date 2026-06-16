using _66SMS.Application.DTOs.MembershipTiers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.MembershipTiers.Queries.GetDetailMembershipTier
{
    public class GetDetailMembershipTierHandler : IRequestHandler<GetDetailMembershipTierQuery, Result<MembershipTierDto>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly IMapper mapper;

        public GetDetailMembershipTierHandler(IMembershipTierSqlRepository membershipTierSqlRepository, IMapper mapper)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<MembershipTierDto>> Handle(GetDetailMembershipTierQuery request, CancellationToken cancellationToken)
        {
            MembershipTierDto? membershipTierDto = await membershipTierSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<MembershipTierDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (membershipTierDto == null)
            {
                return Result<MembershipTierDto>.NotFound("Membership tier not found.", ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
            }

            return Result<MembershipTierDto>.Success(membershipTierDto);
        }
    }
}
