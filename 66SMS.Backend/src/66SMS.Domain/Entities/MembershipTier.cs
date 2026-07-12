using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class MembershipTier : EntityBase<int>
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal MinSpending { get; set; }
        public int? DiscountPercent { get; set; }
        public decimal PointMultiplier { get; set; }
        public string? Benefits { get; set; }
        public int Status { get; set; }

        public ICollection<MembershipCard>? Cards { get; set; }
    }
}
