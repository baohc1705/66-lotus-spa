using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class ShiftSqlRepository : GenericSqlRepository<Shift, int>, IShiftSqlRepository
    {
        public ShiftSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
