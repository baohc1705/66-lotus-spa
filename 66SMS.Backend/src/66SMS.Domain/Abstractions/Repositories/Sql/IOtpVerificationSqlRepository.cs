using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IOtpVerificationSqlRepository : IGenericSqlRepository<OtpVerification, int>
    {
        Task<OtpVerification?> FindLatestByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    }
}
