using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.IdentityService.Roles.Commands.UpdateRole
{
    /// <summary>
    /// Update role request
    /// </summary>
    public class UpdateRoleCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? UpdatedBy { get; set; }

    }
}
