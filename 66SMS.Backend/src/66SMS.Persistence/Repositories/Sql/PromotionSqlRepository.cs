using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class PromotionSqlRepository : GenericSqlRepository<Promotion, int>, IPromotionSqlRepository
    {
        public PromotionSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
