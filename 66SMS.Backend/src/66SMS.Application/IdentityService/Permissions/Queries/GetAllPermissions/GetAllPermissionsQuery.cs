using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.IdentityService.Permissions.Queries.GetAllPermissions
{
    public class GetAllPermissionsQuery : IRequest<Result<List<PermissionDTO>>>
    {
    }
}
