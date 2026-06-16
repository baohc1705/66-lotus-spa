using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using System.Data;

namespace _66SMS.Application.Features.MembershipCards.Commands.UpdateMembershipCards
{
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
            MembershipCard membershipCard = await membershipCardSqlRepository.FindByIdAsync(request.Id);
            if (membershipCard == null)
            {
                return Result<object>.NotFound("Membership card not found.", ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            if (request.CustomerId.HasValue)
            {
                Customer customer = await customerSqlRepository.FindByIdAsync(request.CustomerId.Value);
                if (customer == null)
                {
                    return Result<object>.NotFound("Customer not found.", ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                }
            }

            int? oldTierId = null;
            if (request.MembershipTierId.HasValue && request.MembershipTierId.Value != membershipCard.MembershipTierId)
            {
                MembershipTier tier = await membershipTierSqlRepository.FindByIdAsync(request.MembershipTierId.Value);
                if (tier == null)
                {
                    return Result<object>.NotFound("Membership tier not found.", ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
                }
                oldTierId = membershipCard.MembershipTierId;
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                mapper.Map(request, membershipCard);
                membershipCard.UpdatedAt = DateTime.UtcNow;
                membershipCard.UpdatedBy = request.UpdatedBy;

                membershipCardSqlRepository.Update(membershipCard);

                // Ghi log vào MembershipCardHistory nếu có thay đổi Tier
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

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success(null);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return Result<object>.Failure(500, $"An error occurred while updating membership card: {ex.Message}");
            }
        }
    }
}
