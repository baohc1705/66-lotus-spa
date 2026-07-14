using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards
{
    /// <summary>
    /// handler for <see cref="UpdateMembershipCardCommand"/>
    /// </summary>
    public class UpdateMembershipCardHandler : IRequestHandler<UpdateMembershipCardCommand, Result<object>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly ICustomerSqlRepository customerSqlRepository;
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateMembershipCardHandler(
            IMembershipCardSqlRepository membershipCardSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdateMembershipCardCommand request, CancellationToken cancellationToken)
        {
            // find membership card by id and tracking to update
            MembershipCard? membershipCard = await membershipCardSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // return not found if membership card is null
            if (membershipCard == null)
            {
                return Result<object>.NotFound(MembershipCardConst.MSG_MEMBERSHIP_CARD_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            // find customer if request provived
            if (request.CustomerId.HasValue)
            {
                Customer? customer = await customerSqlRepository.FindByIdAsync(request.CustomerId.Value);
                if (customer == null)
                {
                    return Result<object>.NotFound(CustomerConst.MSG_CUSTOMER_NOT_FOUND, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                }
            }

            if (request.MembershipTierId.HasValue && request.MembershipTierId.Value != membershipCard.MembershipTierId)
            {
                MembershipTier? tier = await membershipTierSqlRepository.FindByIdAsync(request.MembershipTierId.Value);
                if (tier == null)
                {
                    return Result<object>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
                }
            }

            mapper.Map(request, membershipCard);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                membershipCardSqlRepository.Update(membershipCard);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
