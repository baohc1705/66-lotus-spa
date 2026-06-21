using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission
{
    /// <summary>
    /// Request for create permission
    /// </summary>
    public class CreatePermissionCommand : IRequest<Result<object>>
    {
        public string Name { get; set; } = null!;
        public string Resource { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string? Description { get; set; }
        [JsonIgnore]
        public int? Status { get; set;  } = PermissionConst.STATUS_ACTIVED;
        [JsonIgnore]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
