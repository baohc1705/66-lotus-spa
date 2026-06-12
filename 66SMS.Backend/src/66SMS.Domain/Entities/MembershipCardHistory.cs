using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class MembershipCardHistory : EntityBase<int>
    {
        public int MembershipCardId { get; set; }
        public int? OldTierId { get; set; }
        public int NewTierId { get; set; }
        public string? Reason { get; set; }
        public int ChangedBy { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }

        // Navigation properties
        public MembershipCard? Card { get; set; }
        public MembershipTier? OldTier { get; set; }
        public MembershipTier? NewTier { get; set; }
        public User? ChangedByUser { get; set; }
    }
}
