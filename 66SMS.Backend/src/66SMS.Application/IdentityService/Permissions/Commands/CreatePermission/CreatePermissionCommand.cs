using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Permissions.Commands.CreatePermission
{
    public class CreatePermissionCommand : IRequest<Result<object>>
    {
        public string Name { get; set; } = null!;
        public string Resource { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}
