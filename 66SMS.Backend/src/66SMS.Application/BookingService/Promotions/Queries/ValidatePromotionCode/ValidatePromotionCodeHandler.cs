using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Promotions.Queries.ValidatePromotionCode
{
    public class ValidatePromotionCodeHandler : IRequestHandler<ValidatePromotionCodeQuery, Result<PromotionValidationDto>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;

        public ValidatePromotionCodeHandler(IPromotionSqlRepository promotionSqlRepository)
        {
            this.promotionSqlRepository = promotionSqlRepository;
        }

        public async Task<Result<PromotionValidationDto>> Handle(ValidatePromotionCodeQuery request, CancellationToken cancellationToken)
        {
            var promo = await promotionSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.Code == request.Code && x.Status != PromotionConst.STATUS_DELETED)
                .FirstOrDefaultAsync(cancellationToken);

            if (promo == null)
            {
                return Result<PromotionValidationDto>.BadRequest(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);
            }

            if (promo.Status != PromotionConst.STATUS_ACTIVE)
            {
                return Result<PromotionValidationDto>.BadRequest(PromotionConst.MSG_PROMOTION_INACTIVE, ErrorCodes.ERR_PROMOTION_INACTIVE);
            }

            var now = DateTimeHelper.UtcNow();
            if (promo.StartDate > now || promo.EndDate < now)
            {
                return Result<PromotionValidationDto>.BadRequest(PromotionConst.MSG_PROMOTION_EXPIRED, ErrorCodes.ERR_PROMOTION_EXPIRED);
            }

            if (promo.UsageLimit > 0 && promo.UsedCount >= promo.UsageLimit.Value)
            {
                return Result<PromotionValidationDto>.BadRequest(PromotionConst.MSG_PROMOTION_USAGE_LIMIT, ErrorCodes.ERR_PROMOTION_USAGE_LIMIT);
            }

            if (promo.MinOrderValue.HasValue && request.OrderTotal < promo.MinOrderValue.Value)
            {
                return Result<PromotionValidationDto>.BadRequest(PromotionConst.MSG_PROMOTION_MIN_ORDER, ErrorCodes.ERR_PROMOTION_MIN_ORDER);
            }

            decimal discountAmount = 0m;
            if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT)
            {
                var percent = promo.DiscountValue ?? 0m;
                discountAmount = Math.Round(request.OrderTotal * percent / 100m, 0, MidpointRounding.AwayFromZero);
                
                if (promo.MaxDiscountAmount > 0 && discountAmount > promo.MaxDiscountAmount.Value)
                {
                    discountAmount = promo.MaxDiscountAmount.Value;
                }
            }
            else if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED)
            {
                discountAmount = promo.DiscountValue ?? 0m;
                if (discountAmount > request.OrderTotal)
                {
                    discountAmount = request.OrderTotal;
                }
            }
            else if (promo.DiscountType == PromotionConst.DISCOUNT_TYPE_BUYXGETY)
            {
                return Result<PromotionValidationDto>.BadRequest(
                    PromotionConst.MSG_PROMOTION_BUYXGETY_NOT_SUPPORTED,
                    ErrorCodes.ERR_PROMOTION_INVALID);
            }

            if (discountAmount <= 0)
            {
                return Result<PromotionValidationDto>.BadRequest(
                    PromotionConst.MSG_PROMOTION_ZERO_DISCOUNT,
                    ErrorCodes.ERR_PROMOTION_INVALID);
            }

            var finalAmount = Math.Max(0m, request.OrderTotal - discountAmount);

            var dto = new PromotionValidationDto
            {
                Id = promo.Id,
                Code = promo.Code,
                Name = promo.Name,
                DiscountType = promo.DiscountType,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount
            };

            return Result<PromotionValidationDto>.Success(dto);
        }
    }
}
