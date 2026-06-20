using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.CreateMembershipCards
{
    public class CreateMembershipCardCommand : IRequest<Result<int>>
    {
        public int CustomerId { get; set; }
        public int? MembershipTierId { get; set; }
        public string? MembershipTierName { get; set; }
        public string CardCode { get; set; } = string.Empty;
        public DateTime IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int Status { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }

        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
