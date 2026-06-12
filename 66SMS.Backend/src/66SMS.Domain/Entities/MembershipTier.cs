using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class MembershipTier : EntityBase<int>
    {
        public string Name { get; set; } = string.Empty;
        public decimal MinSpending { get; set; }
        public int? DiscountPercent { get; set; }
        public decimal PointMultiplier { get; set; }
        public string? Benefits { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public ICollection<MembershipCard>? Cards { get; set; }
    }
}
