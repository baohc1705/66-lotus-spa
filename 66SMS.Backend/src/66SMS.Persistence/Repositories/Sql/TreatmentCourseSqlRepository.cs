using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class TreatmentCourseSqlRepository : GenericSqlRepository<TreatmentCourse, int>, ITreatmentCourseSqlRepository
    {
        public TreatmentCourseSqlRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
