using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.UpdateMembershipCards
{
    public class UpdateMembershipCardCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int? CustomerId { get; set; }
        public int? MembershipTierId { get; set; }
        public string? CardCode { get; set; }
        public DateTimeOffset? IssuedAt { get; set; }
        public DateTimeOffset? ExpiresAt { get; set; }
        public int? Status { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
    }
}
