using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetAllMembershipCards
{
    public class GetAllMembershipCardHandler : IRequestHandler<GetAllMembershipCardQuery, Result<PagedResult<MembershipCardDto>>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;

        public GetAllMembershipCardHandler(IMembershipCardSqlRepository membershipCardSqlRepository)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
        }

        public async Task<Result<PagedResult<MembershipCardDto>>> Handle(GetAllMembershipCardQuery request, CancellationToken cancellationToken)
        {
            IQueryable<MembershipCard> query = membershipCardSqlRepository.AsQueryable()
                .Where(x => x.Status != MembershipCardConst.STATUS_REVOKED);

            if (request.CustomerId.HasValue)
                query = query.Where(x => x.CustomerId == request.CustomerId.Value);

            if (request.MembershipTierId.HasValue)
                query = query.Where(x => x.MembershipTierId == request.MembershipTierId.Value);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            if (!string.IsNullOrEmpty(request.Filter))
            {
                string keywordLower = request.Filter.ToLower();
                query = query.Where(x => x.CardCode.ToLower().Contains(keywordLower)
                    || (x.Customer != null && x.Customer.FullName.ToLower().Contains(keywordLower)));
            }

            var result = await query
                .Select(x => new MembershipCardDto
                {
                    Id = x.Id,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer != null ? x.Customer.FullName : null,
                    MembershipTierId = x.MembershipTierId,
                    TierName = x.Tier != null ? x.Tier.Name : null,
                    CardCode = x.CardCode,
                    IssuedAt = x.IssuedAt,
                    ExpiresAt = x.ExpiresAt,
                    Status = x.Status,
                    CreatedAt = x.IssuedAt,
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<MembershipCardDto>>.Success(result);
        }
    }
}
