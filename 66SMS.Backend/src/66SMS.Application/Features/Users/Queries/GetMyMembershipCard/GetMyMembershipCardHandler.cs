using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace _66SMS.Application.Features.Users.Queries.GetMyMembershipCard
{
    public class GetMyMembershipCardHandler : IRequestHandler<GetMyMembershipCardQuery, Result<MembershipCardDto>>
    {
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly IMapper mapper;

        public GetMyMembershipCardHandler(
            ICustomerSqlRepository customerSqlRepository,
            IMembershipCardSqlRepository membershipCardSqlRepository,
            IMapper mapper)
        {
            this.customerSqlRepository = customerSqlRepository;
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.mapper = mapper;
        }

        public async Task<Result<MembershipCardDto>> Handle(GetMyMembershipCardQuery request, CancellationToken cancellationToken)
        {
            var customer = await customerSqlRepository.AsQueryable(asNoTracking: true)
                .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

            if (customer == null)
            {
                return Result<MembershipCardDto>.NotFound("Customer profile not found.");
            }

            MembershipCardDto? membershipCardDto = await membershipCardSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.CustomerId == customer.Id)
                .ProjectTo<MembershipCardDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (membershipCardDto == null)
            {
                return Result<MembershipCardDto>.NotFound("Membership card not found.");
            }

            return Result<MembershipCardDto>.Success(membershipCardDto);
        }
    }
}
