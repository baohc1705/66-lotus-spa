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
        public string? IssuedAt { get; set; }
        public string? ExpiresAt { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
