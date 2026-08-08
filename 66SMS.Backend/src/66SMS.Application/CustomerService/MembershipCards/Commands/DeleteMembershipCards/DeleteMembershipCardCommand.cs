using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.CustomerService.MembershipCards.Commands.DeleteMembershipCards
{
    /// <summary>
    /// Delete membershipcard by id request
    /// </summary>
    public class DeleteMembershipCardCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
