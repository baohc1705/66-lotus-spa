namespace _66SMS.Application.DTOs
{
    public class PromotionDto
    {
        public int? Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? DiscountType { get; set; }
        public string? DiscountTypeName { get; set; }
        public decimal? DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public int? BuyQuantity { get; set; }
        public int? GetQuantity { get; set; }
        public int? UsageLimit { get; set; }
        public int? UsedCount { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public int? Status { get; set; }
        public string? StatusName { get; set; }
        public string? CreatedAt { get; set; }
    }
}
