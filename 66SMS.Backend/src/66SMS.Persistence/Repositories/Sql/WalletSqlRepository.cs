using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class WalletSqlRepository : GenericSqlRepository<Wallet, int>, IWalletSqlRepository
    {
        public WalletSqlRepository(ApplicationDbContext context) : base(context)
        {
        }
    }
}
