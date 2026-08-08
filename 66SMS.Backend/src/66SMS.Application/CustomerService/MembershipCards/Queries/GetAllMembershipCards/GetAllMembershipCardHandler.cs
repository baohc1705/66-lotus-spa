using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contract.Extensions;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using System.Linq;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetAllMembershipCards
{
    public class GetAllMembershipCardHandler : IRequestHandler<GetAllMembershipCardQuery, Result<PagedResult<MembershipCardDto>>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly IMapper mapper;

        public GetAllMembershipCardHandler(IMembershipCardSqlRepository membershipCardSqlRepository, IMapper mapper)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<PagedResult<MembershipCardDto>>> Handle(GetAllMembershipCardQuery request, CancellationToken cancellationToken)
        {
            IQueryable<MembershipCard> query = membershipCardSqlRepository.AsQueryable()
                .Where(x => x.Status != _66SMS.Domain.Constants.MembershipCardConst.STATUS_REVOKED);

            if (request.CustomerId.HasValue)
            {
                query = query.Where(x => x.CustomerId == request.CustomerId.Value);
            }

            if (request.MembershipTierId.HasValue)
            {
                query = query.Where(x => x.MembershipTierId == request.MembershipTierId.Value);
            }

            if (request.Status.HasValue)
            {
                query = query.Where(x => x.Status == request.Status.Value);
            }

            if (!string.IsNullOrEmpty(request.Filter))
            {
                string keywordLower = request.Filter.ToLower();
                query = query.Where(x => x.CardCode.ToLower().Contains(keywordLower) 
                    || (x.Customer != null && x.Customer.FullName.ToLower().Contains(keywordLower)));
            }

            PagedResult<MembershipCardDto> result = await query
                .ProjectTo<MembershipCardDto>(mapper.ConfigurationProvider)
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<MembershipCardDto>>.Success(result);
        }
    }
}
