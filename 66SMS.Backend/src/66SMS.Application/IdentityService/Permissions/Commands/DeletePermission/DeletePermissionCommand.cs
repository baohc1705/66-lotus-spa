using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Permissions.Commands.DeletePermission
{
    /// <summary>
    /// Delete permission request with id
    /// </summary>
    public class DeletePermissionCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
