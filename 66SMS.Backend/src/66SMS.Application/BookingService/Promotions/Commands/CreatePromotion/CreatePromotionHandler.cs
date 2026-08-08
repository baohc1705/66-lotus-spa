using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Promotions.Commands.CreatePromotion
{
    public class CreatePromotionHandler : IRequestHandler<CreatePromotionCommand, Result<object>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        private readonly IMapper mapper;

        public CreatePromotionHandler(IPromotionSqlRepository promotionSqlRepository, ISqlUnitOfWork sqlUnitOfWork, IMapper mapper)
        {
            this.promotionSqlRepository = promotionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
            this.mapper = mapper;
        }

        public async Task<Result<object>> Handle(CreatePromotionCommand request, CancellationToken cancellationToken)
        {
            bool codeExists = await promotionSqlRepository.AsQueryable()
                .AnyAsync(x => x.Code == request.Code && x.Status != PromotionConst.STATUS_DELETED, cancellationToken);

            if (codeExists)
                return Result<object>.Conflict(PromotionConst.MSG_CODE_EXISTED, ErrorCodes.ERR_PROMOTION_CODE_EXISTED);

            Promotion promotion = mapper.Map<Promotion>(request);
            promotion.UsedCount = 0;
            promotion.CreatedAt = DateTimeHelper.UtcNow();
            
            if (promotion.UsageLimit <= 0)
                promotion.UsageLimit = null;
            if (promotion.MaxDiscountAmount <= 0)
                promotion.MaxDiscountAmount = null;

            promotionSqlRepository.Add(promotion);
            await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

            return Result<object>.Created(promotion.Id);
        }
    }
}
