using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards
{
    /// <summary>
    /// Create membership card request
    /// </summary>
    public class CreateMembershipCardCommand : IRequest<Result<int>>
    {
        public int CustomerId { get; set; }
        public int? MembershipTierId { get; set; }
        public string? MembershipTierName { get; set; } // client 
        public string CardCode { get; set; } = string.Empty;
        public DateTime? IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; } 
        public int? Status { get; set; } = MembershipCardConst.STATUS_ACTIVE;

        [JsonIgnore]
        public int? CreatedBy { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
