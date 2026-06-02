using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.CreateRole
{
    public class CreateRoleCommand : IRequest<Result<object>>
    {
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
