using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.CreateRole
{
    public class CreateRoleCommand : IRequest<Result<object>>
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}
