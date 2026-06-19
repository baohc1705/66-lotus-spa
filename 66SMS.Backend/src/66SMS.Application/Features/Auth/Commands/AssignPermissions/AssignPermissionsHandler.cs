using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Constants;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Features.Auth.Commands.AssignPermissions
{
    public class AssignPermissionsHandler : IRequestHandler<AssignPermissionsCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IRolePermissionSqlRepository rolePermissionSqlRepository;
        private readonly IPermissionSqlRepository permissionSqlRepository;
        public AssignPermissionsHandler(IRoleSqlRepository roleSqlRepository, IRolePermissionSqlRepository rolePermissionSqlRepository, IPermissionSqlRepository permissionSqlRepository)
        {
            this.roleSqlRepository = roleSqlRepository;
            this.rolePermissionSqlRepository = rolePermissionSqlRepository;
            this.permissionSqlRepository = permissionSqlRepository;
        }
        public async Task<Result<object>> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
        {
            // Check role id 
            bool hasRole = await roleSqlRepository.AsQueryable().Where(x => x.Id == request.RoleId).AnyAsync(cancellationToken);
            if (!hasRole) return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);
            // Check permission id
            // Ki?m tra s? lu?ng permission trong request c� t?n t?i ? du?i db kh�ng
            bool hasPermission = await permissionSqlRepository.AsQueryable()
                .Where(x => request.PermissionIds.Contains(x.Id))
                .CountAsync(cancellationToken) == request.PermissionIds.Count;
            // Th�m v�o danh s�ch permission ?ng v?i role
            List<RolePermission> rolePermissions = [];
            foreach(var permission in request.PermissionIds)
            {
                rolePermissions.Add(new RolePermission
                {
                    RoleId = request.RoleId,
                    PermissionId = permission,
                    AssignedAt = DateTimeHelper.UtcNow(),
                });
            }

            rolePermissionSqlRepository.AddRange(rolePermissions);
            await rolePermissionSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
