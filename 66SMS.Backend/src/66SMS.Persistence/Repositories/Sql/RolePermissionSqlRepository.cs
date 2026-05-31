using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class RolePermissionSqlRepository : GenericSqlRepository<RolePermission, int>, IRolePermissionSqlRepository
    {
        public RolePermissionSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
        public void Add(RolePermission entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<RolePermission> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(RolePermission entity)
        {
            entity.ModifiedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }
    }
}
