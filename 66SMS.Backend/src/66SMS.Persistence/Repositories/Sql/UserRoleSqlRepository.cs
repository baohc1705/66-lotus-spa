using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
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
                .Where(ur => ur.UserId == userId && !ur.IsDeleted && ur.Role.Status == RoleStatus.ACTIVE)
                .SelectMany(ur => ur.Role.RolePermissions.Where(rp => !rp.IsDeleted))
                .Select(rp => rp.Permission.PermissionKey)
                .Distinct()
                .ToListAsync(cancellationToken);
        }
        public void Add(UserRole entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<UserRole> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(UserRole entity)
        {
            entity.ModifiedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }

        public async Task<Role?> GetRoleByUserIdAsync(int id, CancellationToken cancellationToken)
        {
            return await Entities
                  .AsNoTracking()
                  .Where(x => x.UserId == id)
                  .Select(x => x.Role)
                  .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
