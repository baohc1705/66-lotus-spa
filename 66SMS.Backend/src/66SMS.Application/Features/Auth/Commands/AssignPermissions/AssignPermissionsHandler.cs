using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using MediatR;

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
            bool hasRole = await roleSqlRepository.Query().Where(x => x.Id == request.RoleId).AnyAsync(cancellationToken);
            if (!hasRole) return Result<object>.NotFound("Role not found");
            // Check permission id
            // Kiểm tra số lượng permission trong request có tồn tại ở dưới db không
            bool hasPermission = await permissionSqlRepository.Query()
                .Where(x => request.PermissionIds.Contains(x.Id))
                .CountAsync(cancellationToken) == request.PermissionIds.Count;
            // Thêm vào danh sách permission ứng với role
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
