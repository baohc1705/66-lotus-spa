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
    }
}
