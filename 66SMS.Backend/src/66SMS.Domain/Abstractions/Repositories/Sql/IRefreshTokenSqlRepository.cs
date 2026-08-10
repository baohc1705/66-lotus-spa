using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IRefreshTokenSqlRepository : IGenericSqlRepository<RefreshToken, int>
    {
        /// <summary>
        /// Xóa các refresh token đã bị revoke. Trả về số bản ghi đã xóa.
        /// </summary>
        Task<int> DeleteRevokedAsync(CancellationToken cancellationToken = default);
    }
}
