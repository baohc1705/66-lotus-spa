namespace _66SMS.Application.DTOs.MembershipCards
{
    public class MembershipCardDto
    {
        public int? Id { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public int? MembershipTierId { get; set; }
        public string? TierName { get; set; }
        public string? CardCode { get; set; }
        public DateTimeOffset? IssuedAt { get; set; }
        public DateTimeOffset? ExpiresAt { get; set; }
        public int? Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
