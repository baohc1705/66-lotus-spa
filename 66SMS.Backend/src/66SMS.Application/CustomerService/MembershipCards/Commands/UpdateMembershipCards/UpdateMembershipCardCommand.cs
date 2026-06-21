using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards
{
    public class UpdateMembershipCardCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int? CustomerId { get; set; }
        public int? MembershipTierId { get; set; }
        public string? CardCode { get; set; }
        public DateTime? IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int? Status { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
