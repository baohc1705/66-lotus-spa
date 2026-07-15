using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.IdentityService.Permissions.Commands.UpdatePermission
{
    /// <summary>
    /// Update permission request
    /// </summary>
    public class UpdatePermissionCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Resource { get; set; }
        public string? Action { get; set; }
        public string? Description { get; set; }
        [JsonIgnore]
        public DateTimeOffset? UpdatedAt { get; set; } = DateTimeHelper.UtcNow();
        [JsonIgnore]
        public int? UpdatedBy { get; set; }

    }
}
