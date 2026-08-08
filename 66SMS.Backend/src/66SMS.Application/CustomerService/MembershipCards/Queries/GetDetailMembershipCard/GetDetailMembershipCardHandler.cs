using _66SMS.Application.DTOs.MembershipCards;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.CustomerService.MembershipCards.Queries.GetDetailMembershipCard
{
    public class GetDetailMembershipCardHandler : IRequestHandler<GetDetailMembershipCardQuery, Result<MembershipCardDto>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;

        public GetDetailMembershipCardHandler(IMembershipCardSqlRepository membershipCardSqlRepository, ICustomerSqlRepository customerSqlRepository)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
        }

        public async Task<Result<MembershipCardDto>> Handle(GetDetailMembershipCardQuery request, CancellationToken cancellationToken)
        {
            Customer? customer = null;
            if (request.UserId.HasValue)
            {
                customer = await customerSqlRepository
                     .AsQueryable()
                     .Where(x => x.UserId == request.UserId.Value)
                     .FirstOrDefaultAsync(cancellationToken);

                if (customer is null)
                    return Result<MembershipCardDto>.NotFound(CustomerConst.MSG_CUSTOMER_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
            }

            var query = membershipCardSqlRepository.AsQueryable();

            if (request.Id.HasValue)
            {
                query = query.Where(x => x.Id == request.Id.Value);
            }
            else if (request.CustomerId.HasValue)
            {
                query = query.Where(x => x.CustomerId == request.CustomerId.Value);
            }
            else if (customer != null)
            {
                query = query.Where(x => x.CustomerId == customer.Id);
            }
            else
            {
                return Result<MembershipCardDto>.BadRequest("Search criteria is required.");
            }

            MembershipCardDto? membershipCardDto = await query
                .Select(x => new MembershipCardDto
                {
                    Id = x.Id,
                    CardCode = x.CardCode,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer!.FullName,
                    MembershipTierId = x.MembershipTierId,
                    TierName = x.Tier!.Name,
                    IssuedAt = x.IssuedAt,
                    ExpiresAt = x.ExpiresAt,
                    Status = x.Status,
                    CreatedAt = x.IssuedAt
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (membershipCardDto == null)
            {
                return Result<MembershipCardDto>.NotFound(MembershipCardConst.MSG_MEMBERSHIP_CARD_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            return Result<MembershipCardDto>.Success(membershipCardDto);
        }
    }
}
