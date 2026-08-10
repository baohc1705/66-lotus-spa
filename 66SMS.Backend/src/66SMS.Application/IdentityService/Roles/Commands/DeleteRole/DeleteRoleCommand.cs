using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Commands.DeleteRole
{
    /// <summary>
    /// Delete role request
    /// </summary>
    public class DeleteRoleCommand : IRequest<Result<object>>
    {
        public int Id { get; set; }
    }
}
