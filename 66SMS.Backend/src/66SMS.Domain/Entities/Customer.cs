using _66SMS.Domain.Abstractions.Entities;
using _66SMS.Domain.Enums;

namespace _66SMS.Domain.Entities
{
    public class Customer : EntityAuditTable<int>
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string? Image {  get; set; }
        public DateOnly? Dob { get; set; }
        public GenderConst? Gender { get; set; }
        public string? Phone { get; set; }
        public string? Tier { get; set; }
        public int? LoyaltyPoint { get; set; }
        public DateTime? FirstPurchaseAt { get; set; }
        public DateTime? LastPurchaseAt { get; set; }
        public string? Source { get; set; }
        public CustomerStatus? Status { get; set; }
        public string? Note { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddreess { get; set; }

        public User? User { get; set; }
    }
}
