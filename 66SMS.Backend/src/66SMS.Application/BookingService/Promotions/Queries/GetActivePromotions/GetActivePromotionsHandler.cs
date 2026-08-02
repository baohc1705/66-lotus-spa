using _66SMS.Application.DTOs.Promotions;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Promotions.Queries.GetActivePromotions
{
    public class GetActivePromotionsHandler
        : IRequestHandler<GetActivePromotionsQuery, Result<IReadOnlyList<ActivePromotionDto>>>
    {
        private readonly IPromotionSqlRepository promotionSqlRepository;

        public GetActivePromotionsHandler(IPromotionSqlRepository promotionSqlRepository)
        {
            this.promotionSqlRepository = promotionSqlRepository;
        }

        public async Task<Result<IReadOnlyList<ActivePromotionDto>>> Handle(
            GetActivePromotionsQuery request,
            CancellationToken cancellationToken)
        {
            var now = DateTimeHelper.UtcNow();

            var items = await promotionSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => x.Status == PromotionConst.STATUS_ACTIVE
                    && x.StartDate <= now
                    && x.EndDate >= now
                    && (x.UsageLimit == null || x.UsageLimit <= 0 || x.UsedCount < x.UsageLimit))
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ActivePromotionDto
                {
                    Id = x.Id,
                    Code = x.Code,
                    Name = x.Name,
                    Description = x.Description,
                    DiscountType = x.DiscountType,
                    DiscountTypeName = x.DiscountType == PromotionConst.DISCOUNT_TYPE_PERCENT
                        ? "Giảm theo %"
                        : x.DiscountType == PromotionConst.DISCOUNT_TYPE_FIXED
                            ? "Giảm số tiền cố định"
                            : "Mua X tặng Y",
                    DiscountValue = x.DiscountValue,
                    MaxDiscountAmount = x.MaxDiscountAmount,
                    MinOrderValue = x.MinOrderValue,
                    EndDate = x.EndDate.ToString("dd/MM/yyyy"),
                })
                .ToListAsync(cancellationToken);

            return Result<IReadOnlyList<ActivePromotionDto>>.Success(items);
        }
    }
}
