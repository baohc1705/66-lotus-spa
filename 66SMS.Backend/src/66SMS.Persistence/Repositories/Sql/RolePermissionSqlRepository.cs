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
    }
}
