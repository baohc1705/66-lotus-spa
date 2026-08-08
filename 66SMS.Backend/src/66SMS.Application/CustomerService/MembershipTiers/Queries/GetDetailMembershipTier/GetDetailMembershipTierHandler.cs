using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.DTOs;

namespace _66SMS.Application.CustomerService.MembershipTiers.Queries.GetDetailMembershipTier
{
    public class GetDetailMembershipTierHandler : IRequestHandler<GetDetailMembershipTierQuery, Result<MembershipTierDto>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;

        public GetDetailMembershipTierHandler(IMembershipTierSqlRepository membershipTierSqlRepository)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
        }

        public async Task<Result<MembershipTierDto>> Handle(GetDetailMembershipTierQuery request, CancellationToken cancellationToken)
        {
            var membershipTierDto = await membershipTierSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new MembershipTierDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    MinSpending = x.MinSpending,
                    DiscountPercent = x.DiscountPercent,
                    PointMultiplier = x.PointMultiplier,
                    Benefits = x.Benefits,
                    Status = x.Status,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (membershipTierDto == null)
                return Result<MembershipTierDto>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);

            return Result<MembershipTierDto>.Success(membershipTierDto);
        }
    }
}
