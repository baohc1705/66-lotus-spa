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
            bool hasRole = await roleSqlRepository.AsQueryable().Where(x => x.Id == request.RoleId).AnyAsync(cancellationToken);
            if (!hasRole) return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            if (request.PermissionIds.Count > 0)
            {
                bool allExist = await permissionSqlRepository.AsQueryable()
                    .Where(x => request.PermissionIds.Contains(x.Id))
                    .CountAsync(cancellationToken) == request.PermissionIds.Count;
                if (!allExist) return Result<object>.NotFound("Một hoặc nhiều quyền không tồn tại.", ErrorCodes.ERR_PERMISSION_NOT_FOUND);
            }

            // Xóa toàn bộ permissions cũ của role này trước khi gán mới
            var existing = await rolePermissionSqlRepository.AsQueryable()
                .Where(x => x.RoleId == request.RoleId)
                .ToListAsync(cancellationToken);
            if (existing.Count > 0)
                rolePermissionSqlRepository.RemoveRange(existing);

            List<RolePermission> rolePermissions = [];
            foreach (var permissionId in request.PermissionIds)
            {
                rolePermissions.Add(new RolePermission
                {
                    RoleId = request.RoleId,
                    PermissionId = permissionId,
                    AssignedAt = DateTimeHelper.UtcNow(),
                });
            }

            if (rolePermissions.Count > 0)
                rolePermissionSqlRepository.AddRange(rolePermissions);

            await rolePermissionSqlRepository.SaveChangeAsync(cancellationToken);
            return Result<object>.Ok();
        }
    }
}
