using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class MembershipCard : EntityBase<int>
    {
        public int CustomerId { get; set; }
        public int MembershipTierId { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public DateTimeOffset IssuedAt { get; set; }
        public DateTimeOffset? ExpiresAt { get; set; }
        public int Status { get; set; }

        // Navigation properties
        public Customer? Customer { get; set; }
        public MembershipTier? Tier { get; set; }
    }
}
