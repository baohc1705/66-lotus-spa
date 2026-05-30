using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class PermissionSqlRepository : GenericSqlRepository<Permission, int>, IPermissionSqlRepository
    {
        public PermissionSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
        public void Add(Permission entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<Permission> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(Permission entity)
        {
            entity.ModifiedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }
    }
}
