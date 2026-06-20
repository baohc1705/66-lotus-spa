using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Features.Auth.Commands.DeletePermission
{
    public class DeletePermissionCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
