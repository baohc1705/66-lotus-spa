using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

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
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? UpdatedBy { get; set; }

    }
}
