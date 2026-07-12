using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class RefreshTokenSqlRepository : GenericSqlRepository<RefreshToken, int>, IRefreshTokenSqlRepository
    {
        public RefreshTokenSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<int> DeleteRevokedAsync(CancellationToken cancellationToken = default)
        {
            return Entities
                .Where(x => x.IsRevoked)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}
