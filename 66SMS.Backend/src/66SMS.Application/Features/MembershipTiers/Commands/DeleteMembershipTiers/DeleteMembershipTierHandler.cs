using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.Features.MembershipTiers.Commands.DeleteMembershipTiers
{
    public class DeleteMembershipTierHandler : IRequestHandler<DeleteMembershipTierCommand, Result<object>>
    {
        private readonly IMembershipTierSqlRepository membershipTierSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteMembershipTierHandler(
            IMembershipTierSqlRepository membershipTierSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.membershipTierSqlRepository = membershipTierSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteMembershipTierCommand request, CancellationToken cancellationToken)
        {
            MembershipTier membershipTier = await membershipTierSqlRepository.FindByIdAsync(request.Id);
            if (membershipTier == null)
            {
                return Result<object>.NotFound("Membership tier not found.", ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
            }

            membershipTier.Status = MembershipTierConst.STATUS_DELETED;
            membershipTier.UpdatedAt = DateTime.UtcNow;
            membershipTier.UpdatedBy = request.UpdatedBy;

            membershipTierSqlRepository.Update(membershipTier);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
