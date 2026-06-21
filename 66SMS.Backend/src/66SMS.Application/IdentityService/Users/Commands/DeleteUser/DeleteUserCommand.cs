using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Users.Commands.DeleteUser
{
    /// <summary>
    /// Delete user request
    /// </summary>
    public class DeleteUserCommand : IRequest<Result<object>>
    {
        public int? Id { get; set; }
        public List<int>? Ids { get; set; }
        [JsonIgnore]
        public DateTime? UpdatedAt { get; set; } = DateTime.Now;
        [JsonIgnore]
        public int? UpdatedBy { get; set; }

    }
}
