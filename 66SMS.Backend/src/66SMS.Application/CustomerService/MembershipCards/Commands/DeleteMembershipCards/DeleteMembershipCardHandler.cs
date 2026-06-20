using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.DeleteMembershipCards
{
    public class DeleteMembershipCardHandler : IRequestHandler<DeleteMembershipCardCommand, Result<object>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteMembershipCardHandler(
            IMembershipCardSqlRepository membershipCardSqlRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteMembershipCardCommand request, CancellationToken cancellationToken)
        {
            MembershipCard? membershipCard = await membershipCardSqlRepository.FindByIdAsync(request.Id);
            if (membershipCard == null)
            {
                return Result<object>.NotFound(MembershipCardConst.MSG_MEMBERSHIP_CARD_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            membershipCard.Status = MembershipCardConst.STATUS_REVOKED;
            membershipCard.UpdatedAt = DateTime.UtcNow;
            membershipCard.UpdatedBy = request.UpdatedBy;

            membershipCardSqlRepository.Update(membershipCard);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
