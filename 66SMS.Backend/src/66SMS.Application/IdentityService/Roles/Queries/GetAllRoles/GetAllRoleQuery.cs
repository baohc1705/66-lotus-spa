using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Queries.GetAllRoles
{
    public class GetAllRoleQuery : IRequest<Result<List<RoleDTO>>>
    {
        public List<string>? Include { get; set; }
    }
}
