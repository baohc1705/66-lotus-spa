using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.IdentityService.Roles.Commands.AssignPermissions
{
    /// <summary>
    /// Handler for <see cref="AssignPermissionsCommand"/>
    /// </summary>
    public class AssignPermissionsHandler : IRequestHandler<AssignPermissionsCommand, Result<object>>
    {
        private readonly IRoleSqlRepository roleSqlRepository;
        private readonly IRolePermissionSqlRepository rolePermissionSqlRepository;
        private readonly IPermissionSqlRepository permissionSqlRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;
        public AssignPermissionsHandler(IRoleSqlRepository roleSqlRepository, IRolePermissionSqlRepository rolePermissionSqlRepository, IPermissionSqlRepository permissionSqlRepository, ISqlUnitOfWork sqlUnitOfWork)
        {
            this.roleSqlRepository = roleSqlRepository;
            this.rolePermissionSqlRepository = rolePermissionSqlRepository;
            this.permissionSqlRepository = permissionSqlRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }
        public async Task<Result<object>> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
        {
            // check role existed
            bool hasRole = await roleSqlRepository
                .AsQueryable()
                .Where(x => x.Id == request.RoleId)
                .AnyAsync(cancellationToken);

            // return if role not existed
            if (!hasRole) return Result<object>.NotFound(RoleConst.MSG_ROLE_NOT_FOUND, ErrorCodes.ERR_ROLE_NOT_FOUND);

            // check if permission ids not null
            if (request.PermissionIds!.Count > 0)
            {
                bool allExist = await permissionSqlRepository.AsQueryable()
                    .Where(x => request.PermissionIds.Contains(x.Id))
                    .CountAsync(cancellationToken) == request.PermissionIds.Count;
                if (!allExist)
                    return Result<object>.NotFound("Một hoặc nhiều quyền không tồn tại.", ErrorCodes.ERR_PERMISSION_NOT_FOUND);
            }

            // Find all permission of role 
            var existings = await rolePermissionSqlRepository.AsQueryable()
                .Where(x => x.RoleId == request.RoleId)
                .ToListAsync(cancellationToken);

            // Begin transaction
            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Delete all permission before insert new
                if (existings.Count > 0)
                    rolePermissionSqlRepository.RemoveRange(existings);

                // Assign list permisison
                List<RolePermission> rolePermissions = [];
                foreach (var permissionId in request.PermissionIds)
                {
                    rolePermissions.Add(new RolePermission
                    {
                        RoleId = (int)request.RoleId!,
                        PermissionId = permissionId,
                        AssignedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                    });
                }

                // If list permission not empty then add range and persist to database
                if (rolePermissions.Count > 0)
                    rolePermissionSqlRepository.AddRange(rolePermissions);
                await rolePermissionSqlRepository.SaveChangeAsync(cancellationToken);

                // Commit transaction
                transaction.Commit();

                // return ok result
                return Result<object>.Ok();
            } 
            catch
            {
                // Rollback on failure
                transaction.Rollback(); throw;
            }
        }
    }
}
