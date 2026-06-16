using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.Features.MembershipCards.Commands.DeleteMembershipCards
{
    public class DeleteMembershipCardCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
