using _66SMS.Contracts.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class RoleSqlRepository : GenericSqlRepository<Role, int>, IRoleSqlRepository
    {
        public RoleSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
        public void Add(Role entity)
        {
            entity.CreatedAt = DateTimeHelper.UtcNow();
            base.Add(entity);
        }

        public void AddRange(List<Role> entities)
        {
            foreach (var entity in entities)
                entity.CreatedAt = DateTimeHelper.UtcNow();
            base.AddRange(entities);
        }
        public void Update(Role entity)
        {
            entity.ModifiedAt = DateTimeHelper.UtcNow();
            base.Update(entity);
        }
    }
}
