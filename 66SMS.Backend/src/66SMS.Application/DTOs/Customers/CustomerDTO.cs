namespace _66SMS.Application.DTOs.Customers
{
    public class CustomerDTO
    {
        public int? Id { get; set; }
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? Phone { get; set; }
        public int? LoyaltyPoint { get; set; }
        public string? FirstPurchaseAt { get; set; }
        public string? LastPurchaseAt { get; set; }
        public string? Source { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public string? FullAddress { get; set; }
        public string? Email { get; set; }
    }
}
