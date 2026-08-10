using _66SMS.Application.DTOs;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipTiers.Queries.GetAllMembershipTiers
{
    public class GetAllMembershipTierHandler : IRequestHandler<GetAllMembershipTierQuery, Result<PagedResult<MembershipTierDto>>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;

        public GetAllMembershipTierHandler(IMembershipTierSqlRepository membershipTierSqlRepository)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
        }

        public async Task<Result<PagedResult<MembershipTierDto>>> Handle(GetAllMembershipTierQuery request, CancellationToken cancellationToken)
        {
            var query = membershipTierSqlRepository.AsQueryable()
                .Where(x => x.Status != MembershipTierConst.STATUS_DELETED);

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keywordLower = request.Keyword.ToLower();
                query = query.Where(x => x.Name.ToLower().Contains(keywordLower));
            }

            var result = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<MembershipTierDto>>.Success(result);
        }
    }
}
