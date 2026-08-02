using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Promotions.Commands.UpdatePromotion
{
    public class UpdatePromotionHandler : IRequestHandler<UpdatePromotionCommand, Result<object>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public UpdatePromotionHandler(IPromotionSqlRepository promotionSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.promotionSqlRepository = promotionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(UpdatePromotionCommand request, CancellationToken cancellationToken)
        {
            Promotion? promotion = await promotionSqlRepository.FindByIdAsync((int)request.Id!, false);
            if (promotion == null)
                return Result<object>.NotFound(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);

            if (request.Code != null)
            {
                bool codeExists = await promotionSqlRepository.AsQueryable()
                    .AnyAsync(x => x.Code == request.Code && x.Id != request.Id && x.Status != PromotionConst.STATUS_DELETED, cancellationToken);

                if (codeExists)
                    return Result<object>.Conflict(PromotionConst.MSG_CODE_EXISTED, ErrorCodes.ERR_PROMOTION_CODE_EXISTED);
            }

            mapper.Map(request, promotion);

            if (promotion.UsageLimit <= 0)
                promotion.UsageLimit = null;
            if (promotion.MaxDiscountAmount <= 0)
                promotion.MaxDiscountAmount = null;

            promotionSqlRepository.Update(promotion);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Created(promotion.Id);
        }
    }
}
