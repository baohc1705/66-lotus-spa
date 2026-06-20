using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.DeleteRole
{
    public class DeleteRoleCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
