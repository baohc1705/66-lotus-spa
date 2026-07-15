using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CustomerService.Customers.Commands.UpdateCustomer
{
    /// <summary>
    /// Update customer existed by id request
    /// </summary>
    public class UpdateCustomerCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        /// <summary>Base64 ảnh mới — upload qua IImageUploadService.</summary>
        public string? ImageBase64 { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Gender { get; set; }
        public string? Phone { get; set; }
        public int? LoyaltyPoint { get; set; }
        public DateTimeOffset? FirstPurchaseAt { get; set; }
        public DateTimeOffset? LastPurchaseAt { get; set; }
        public string? Source { get; set; }
        public int? Status { get; set; } = CustomerConst.STATUS_ACTIVED;
        public string? Note { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
