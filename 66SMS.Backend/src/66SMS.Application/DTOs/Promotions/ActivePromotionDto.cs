namespace _66SMS.Application.DTOs.Promotions
{
    public class ActivePromotionDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DiscountType { get; set; }
        public string DiscountTypeName { get; set; } = null!;
        public decimal? DiscountValue { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public string? EndDate { get; set; }
    }
}
