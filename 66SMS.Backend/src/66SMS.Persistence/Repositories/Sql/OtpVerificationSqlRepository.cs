using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class OtpVerificationSqlRepository : GenericSqlRepository<OtpVerification, int>, IOtpVerificationSqlRepository
    {
        public OtpVerificationSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<OtpVerification?> FindLatestByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await AsQueryable(false)
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
