namespace _66SMS.Application.DTOs.MembershipTiers
{
    public class MembershipTierDto
    {
        public int? Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public decimal? MinSpending { get; set; }
        public int? DiscountPercent { get; set; }
        public decimal? PointMultiplier { get; set; }
        public string? Benefits { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
