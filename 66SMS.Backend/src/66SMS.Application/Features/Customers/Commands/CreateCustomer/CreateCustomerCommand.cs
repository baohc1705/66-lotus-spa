using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.Customers.Commands.CreateCustomer
{
    public record CreateCustomerCommand : IRequest<Result<object>>
    {
        // Profile
        [JsonIgnore]
        public int? UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? Phone { get; set; }
        public int? LoyaltyPoint { get; set; }
        public DateTime? FirstPurchaseAt { get; set; }
        public DateTime? LastPurchaseAt { get; set; }
        public string? Source { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }
        // Account
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
        [JsonIgnore]
        public string? Role { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
