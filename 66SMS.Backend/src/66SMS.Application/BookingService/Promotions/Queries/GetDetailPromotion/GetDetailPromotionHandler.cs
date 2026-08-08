using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Promotions.Queries.GetDetailPromotion
{
    public class GetDetailPromotionHandler : IRequestHandler<GetDetailPromotionQuery, Result<PromotionDto>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;

        public GetDetailPromotionHandler(IPromotionSqlRepository promotionSqlRepository)
        {
            this.promotionSqlRepository = promotionSqlRepository;
        }

        public async Task<Result<PromotionDto>> Handle(GetDetailPromotionQuery request, CancellationToken cancellationToken)
        {
            PromotionDto? dto = await promotionSqlRepository.AsQueryable()
                .Where(x => x.Id == request.Id && x.Status != PromotionConst.STATUS_DELETED)
                .Select(x => new PromotionDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    DiscountType = x.DiscountType,
                    DiscountTypeName = x.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT ? "Giảm theo %"
                        : x.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED ? "Giảm số tiền cố định"
                        : "Mua X tặng Y",
                    DiscountValue = x.DiscountValue,
                    MaxDiscountAmount = x.MaxDiscountAmount,
                    MinOrderValue = x.MinOrderValue,
                    BuyQuantity = x.BuyQuantity,
                    GetQuantity = x.GetQuantity,
                    UsageLimit = x.UsageLimit,
                    UsedCount = x.UsedCount,
                    StartDate = x.StartDate.ToString("dd/MM/yyyy HH:mm"),
                    EndDate = x.EndDate.ToString("dd/MM/yyyy HH:mm"),
                    Status = x.Status,
                    StatusName = x.Status == PromotionConst.STATUS_ACTIVE ? "Đang hoạt động"
                        : x.Status == PromotionConst.STATUS_INACTIVE ? "Không hoạt động"
                        : "Đã xóa",
                    CreatedAt = x.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (dto == null)
                return Result<PromotionDto>.NotFound(PromotionConst.MSG_PROMOTION_NOT_FOUND, ErrorCodes.ERR_PROMOTION_NOT_FOUND);

            return Result<PromotionDto>.Success(dto);
        }
    }
}
