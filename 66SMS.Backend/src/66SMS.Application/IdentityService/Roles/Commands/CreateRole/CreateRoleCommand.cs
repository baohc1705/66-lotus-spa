using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.IdentityService.Roles.Commands.CreateRole
{
    /// <summary>
    /// Create role request
    /// </summary>
    public class CreateRoleCommand : IRequest<Result<int>>
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;

        [JsonIgnore]
        public DateTimeOffset? CreatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
