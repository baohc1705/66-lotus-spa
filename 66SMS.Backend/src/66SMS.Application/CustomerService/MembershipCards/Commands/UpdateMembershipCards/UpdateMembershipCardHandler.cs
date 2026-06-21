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
        private readonly IMembershipCardHistorySqlRepository membershipCardHistorySqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdateMembershipCardHandler(
            IMembershipCardSqlRepository membershipCardSqlRepository,
            ICustomerSqlRepository customerSqlRepository,
            IMembershipTierSqlRepository membershipTierSqlRepository,
            IMembershipCardHistorySqlRepository membershipCardHistorySqlRepository,
            ISqlUnitOfWork sqlUnitOfWork,
            IMapper mapper)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.customerSqlRepository = customerSqlRepository;
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.membershipCardHistorySqlRepository = membershipCardHistorySqlRepository;
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

            // set oldtier id 
            int? oldTierId = null;
            if (request.MembershipTierId.HasValue && request.MembershipTierId.Value != membershipCard.MembershipTierId)
            {
                MembershipTier? tier = await membershipTierSqlRepository.FindByIdAsync(request.MembershipTierId.Value);
                if (tier == null)
                {
                    return Result<object>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
                }
                oldTierId = membershipCard.MembershipTierId;
            }

            // map request to domain entity
            mapper.Map(request, membershipCard);

            // begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // tracking update
                membershipCardSqlRepository.Update(membershipCard);

                // save log if change membership card tier
                if (oldTierId.HasValue && request.MembershipTierId.HasValue)
                {
                    MembershipCardHistory history = new MembershipCardHistory
                    {
                        MembershipCardId = membershipCard.Id,
                        OldTierId = oldTierId,
                        NewTierId = request.MembershipTierId.Value,
                        Reason = "Manual tier update",
                        ChangedBy = request.UpdatedBy ?? 1,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = request.UpdatedBy ?? 1
                    };
                    membershipCardHistorySqlRepository.Add(history);
                }

                // persist to database
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // commit transaction
                transaction.Commit();

                // return success result
                return Result<object>.Ok();
            }
            catch (Exception ex)
            {
                // rollback transaction on failure
                transaction.Rollback(); throw;
            }
        }
    }
}
