using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.MembershipTiers.Commands.DeleteMembershipTiers
{
    public class DeleteMembershipTierCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
