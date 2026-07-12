using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipTiers.Commands.DeleteMembershipTiers
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
            MembershipTier? membershipTier = await membershipTierSqlRepository.FindByIdAsync(request.Id);
            if (membershipTier == null)
            {
                return Result<object>.NotFound(MembershipTierConst.MSG_MEMBERSHIP_TIER_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_TIER_NOT_FOUND);
            }

            membershipTierSqlRepository.Update(membershipTier);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
