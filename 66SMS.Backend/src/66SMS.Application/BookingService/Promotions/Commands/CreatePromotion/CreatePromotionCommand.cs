using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Promotions.Commands.CreatePromotion
{
    public record CreatePromotionCommand : IRequest<Result<object>>
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public int? BuyQuantity { get; set; }
        public int? GetQuantity { get; set; }
        public int? UsageLimit { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public int? Status { get; set; } = PromotionConst.STATUS_ACTIVE;

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
