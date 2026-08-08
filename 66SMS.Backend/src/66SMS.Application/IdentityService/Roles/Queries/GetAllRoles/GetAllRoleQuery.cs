using _66SMS.Application.DTOs.Auth;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Roles.Queries.GetAllRoles
{
    /// <summary>
    /// Get all role request with params key include
    /// </summary>
    public class GetAllRoleQuery : IRequest<Result<List<RoleDTO>>>
    {
        public List<string>? Include { get; set; }
    }
}
