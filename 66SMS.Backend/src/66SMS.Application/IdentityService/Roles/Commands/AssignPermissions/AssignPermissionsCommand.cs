using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.AssignPermissions
{
    public class AssignPermissionsCommand : IRequest<Result<object>>
    {
        public int RoleId { get; set; }
        public List<int> PermissionIds { get; set; } = null!;
    }
}
