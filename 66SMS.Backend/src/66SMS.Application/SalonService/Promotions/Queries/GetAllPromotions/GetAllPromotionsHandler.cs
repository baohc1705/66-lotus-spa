using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Promotions.Queries.GetAllPromotions
{
    public class GetAllPromotionsHandler : IRequestHandler<GetAllPromotionsQuery, Result<PagedResult<PromotionDto>>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;

        public GetAllPromotionsHandler(IPromotionSqlRepository promotionSqlRepository)
        {
            this.promotionSqlRepository = promotionSqlRepository;
        }

        public async Task<Result<PagedResult<PromotionDto>>> Handle(GetAllPromotionsQuery request, CancellationToken cancellationToken)
        {
            var query = promotionSqlRepository.AsQueryable()
                .Where(x => x.Status != PromotionConst.STATUS_DELETED);

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status.Value);

            if (!string.IsNullOrEmpty(request.Keyword))
                query = query.Where(x => x.Code.Contains(request.Keyword) || x.Name.Contains(request.Keyword));

            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
                "name" => request.IsDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "startdate" => request.IsDescending ? query.OrderByDescending(x => x.StartDate) : query.OrderBy(x => x.StartDate),
                "enddate" => request.IsDescending ? query.OrderByDescending(x => x.EndDate) : query.OrderBy(x => x.EndDate),
                _ => request.IsDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            PagedResult<PromotionDto> pagedDto = await query
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
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<PromotionDto>>.Success(pagedDto);
        }
    }
}
