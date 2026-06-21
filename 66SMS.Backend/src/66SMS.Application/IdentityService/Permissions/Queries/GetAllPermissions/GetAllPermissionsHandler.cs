using _66SMS.Application.DTOs.Auth;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.IdentityService.Permissions.Queries.GetAllPermissions
{
    /// <summary>
    /// Handler for <see cref="GetAllPermissionsQuery"/>
    /// </summary>
    public class GetAllPermissionsHandler : IRequestHandler<GetAllPermissionsQuery, Result<List<PermissionDTO>>>
    {
        private readonly IPermissionSqlRepository permissionSqlRepository;

        public GetAllPermissionsHandler(IPermissionSqlRepository permissionSqlRepository)
        {
            this.permissionSqlRepository = permissionSqlRepository;
        }

        public async Task<Result<List<PermissionDTO>>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
        {
            var permissions = await permissionSqlRepository
                .AsQueryable()
                .Select(p => new PermissionDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Resource = p.Resource,
                    Action = p.Action,
                    Description = p.Description,
                })
                .ToListAsync(cancellationToken);

            return Result<List<PermissionDTO>>.Success(permissions);
        }
    }
}
