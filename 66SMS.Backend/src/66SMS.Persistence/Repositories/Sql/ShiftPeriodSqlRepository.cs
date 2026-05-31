using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class ShiftPeriodSqlRepository : GenericSqlRepository<ShiftPeriod, int>, IShiftPeriodSqlRepository
    {
        public ShiftPeriodSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
