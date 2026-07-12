using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.DeleteMembershipCards
{
    /// <summary>
    /// handler for <see cref="DeleteMembershipCardCommand"/>
    /// </summary>
    public class DeleteMembershipCardHandler : IRequestHandler<DeleteMembershipCardCommand, Result<object>>
    {
        private readonly IMembershipCardSqlRepository membershipCardSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeleteMembershipCardHandler(IMembershipCardSqlRepository membershipCardSqlRepository,ISqlUnitOfWork sqlUnitOfWork)
        {
            this.membershipCardSqlRepository = membershipCardSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeleteMembershipCardCommand request, CancellationToken cancellationToken)
        {
            // find membership card with id and tracking to delete
            MembershipCard? membershipCard = await membershipCardSqlRepository.FindByIdAsync(request.Id, false, cancellationToken);

            // return not found if membership is null
            if (membershipCard == null)
            {
                return Result<object>.NotFound(MembershipCardConst.MSG_MEMBERSHIP_CARD_NOT_FOUND, ErrorCodes.ERR_MEMBERSHIP_CARD_NOT_FOUND);
            }

            // update status is  deleted
            membershipCard.Status = MembershipCardConst.STATUS_REVOKED;

            // update and persist to database
            membershipCardSqlRepository.Update(membershipCard);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            // return success result
            return Result<object>.Ok();
        }
    }
}
