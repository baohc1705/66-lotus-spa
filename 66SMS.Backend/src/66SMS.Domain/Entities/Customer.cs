using _66SMS.Domain.Abstractions.Entities;
using System.Text.Json.Serialization;

namespace _66SMS.Domain.Entities
{
    public class Customer : EntityBase<int>
    {
        public int? UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl {  get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? Phone { get; set; }
        public int? LoyaltyPoint { get; set; }
        public DateTime? FirstPurchaseAt { get; set; }
        public DateTime? LastPurchaseAt { get; set; }
        public string? Source { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        [JsonIgnore]
        public User User { get; set; } = null!;
        [JsonIgnore]
        public Wallet? Wallet  { get; set; }
        [JsonIgnore]
        public MembershipCard? MembershipCard { get; set; }
    }
}
