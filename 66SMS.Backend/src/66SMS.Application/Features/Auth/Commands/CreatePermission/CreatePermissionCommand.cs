using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.CreatePermission
{
    public class CreatePermissionCommand : IRequest<Result<object>>
    {
        public string Name { get; set; }
        public string Resource { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
    }
}
