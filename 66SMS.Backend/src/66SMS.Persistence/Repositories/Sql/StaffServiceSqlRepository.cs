using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using _66SMS.Domain.Abstractions.Repositories.Sql;

namespace _66SMS.Persistence.Repositories.Sql;

public class StaffServiceSqlRepository : GenericSqlRepository<StaffService, int>, IStaffServiceSqlRepository
{
    public StaffServiceSqlRepository(ApplicationDbContext context) : base(context)
    {
    }

}
