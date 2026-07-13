using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Users.Commands.UpdateUser
{
    /// <summary>
    /// Update user account request
    /// </summary>
    public class UpdateUserCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int? Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public bool? IsEmailConfirmed { get; set; }
        public int? AccessFailedCount { get; set; }
        public int? Status { get; set; }
        public DateTimeOffset? LockoutEnd { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdateAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
