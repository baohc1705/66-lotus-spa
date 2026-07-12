using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class MembershipCard : EntityBase<int>
    {
        public int CustomerId { get; set; }
        public int MembershipTierId { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int Status { get; set; }

        // Navigation properties
        public Customer? Customer { get; set; }
        public MembershipTier? Tier { get; set; }
        public ICollection<MembershipCardHistory>? Histories { get; set; }
    }
}
