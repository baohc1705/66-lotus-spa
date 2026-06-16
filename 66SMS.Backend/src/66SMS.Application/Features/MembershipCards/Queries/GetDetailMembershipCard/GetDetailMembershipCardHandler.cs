using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.MembershipCards.Queries.GetDetailMembershipCard
{
    public class GetDetailMembershipCardHandler : IRequestHandler<GetDetailMembershipCardQuery, Result<MembershipCardDto>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly IMapper mapper;

        public GetDetailMembershipCardHandler(IMembershipCardSqlRepository membershipCardSqlRepository, IMapper mapper)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<MembershipCardDto>> Handle(GetDetailMembershipCardQuery request, CancellationToken cancellationToken)
        {
            MembershipCardDto? membershipCardDto = await membershipCardSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id)
                .ProjectTo<MembershipCardDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (membershipCardDto == null)
            {
                return Result<MembershipCardDto>.NotFound("Membership card not found.", ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            return Result<MembershipCardDto>.Success(membershipCardDto);
        }
    }
}
