using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class MembershipCardHistorySqlRepository : GenericSqlRepository<MembershipCardHistory, int>, IMembershipCardHistorySqlRepository
    {
        public MembershipCardHistorySqlRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
