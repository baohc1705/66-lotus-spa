using _66SMS.Contract.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class UserRoleSqlRepository : GenericSqlRepository<UserRole, int>, IUserRoleSqlRepository
    {
        public UserRoleSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
        public async Task<List<string>?> GetPermissionKeysByUserIdAsync(int userId, CancellationToken cancellationToken)
        {
            return await Entities
                .AsNoTracking()
                .Where(ur => ur.UserId == userId && ur.Role!.Status == RoleConst.STATUS_ACTIVED)
                .SelectMany(ur => ur.Role!.RolePermissions!)
                .Where(rp => rp.Permission != null)
                .Select(rp => rp.Permission!.Resource + ":" + rp.Permission.Action)
                .Distinct()
                .ToListAsync(cancellationToken);
        }

        public async Task<List<string>?> GetPermissionKeysByUserIdAndRoleIdAsync(int userId, int roleId, CancellationToken cancellationToken)
        {
            return await Entities
                .AsNoTracking()
                .Where(ur =>
                    ur.UserId == userId &&
                    ur.RoleId == roleId &&
                    ur.Role!.Status == RoleConst.STATUS_ACTIVED)
                .SelectMany(ur => ur.Role!.RolePermissions!)
                .Where(rp => rp.Permission != null)
                .Select(rp => rp.Permission!.Resource + ":" + rp.Permission.Action)
                .Distinct()
                .ToListAsync(cancellationToken);
        }

        // public void Add(UserRole entity)
        // {
        //     if (entity.AssignedAt == default)
        //         entity.AssignedAt = DateTimeHelper.UtcNow();
        //     base.Add(entity);
        // }

        // public void AddRange(List<UserRole> entities)
        // {
        //     foreach (var entity in entities)
        //     {
        //         if (entity.AssignedAt == default)
        //             entity.AssignedAt = DateTimeHelper.UtcNow();
        //     }
        //     base.AddRange(entities);
        // }

        public async Task<Role?> GetRoleByUserIdAsync(int id, CancellationToken cancellationToken)
        {
            return await Entities
                  .AsNoTracking()
                  .Where(x => x.UserId == id &&  x.Role!.Status == RoleConst.STATUS_ACTIVED)
                  .Select(x => x.Role)
                  .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
