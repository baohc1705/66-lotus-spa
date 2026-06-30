using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;

namespace _66SMS.Application.SalonService.Promotions.Commands.DeletePromotion
{
    public class DeletePromotionHandler : IRequestHandler<DeletePromotionCommand, Result<object>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public DeletePromotionHandler(IPromotionSqlRepository promotionSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.promotionSqlRepository = promotionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(DeletePromotionCommand request, CancellationToken cancellationToken)
        {
            Promotion? promotion = await promotionSqlRepository.FindByIdAsync((int)request.Id!, false);
            if (promotion == null)
                return Result<object>.NotFound(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);

            promotion.Status = PromotionConst.STATUS_DELETED;
            promotion.UpdatedAt = DateTime.UtcNow;
            promotion.UpdatedBy = request.UpdatedBy;

            promotionSqlRepository.Update(promotion);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Ok();
        }
    }
}
