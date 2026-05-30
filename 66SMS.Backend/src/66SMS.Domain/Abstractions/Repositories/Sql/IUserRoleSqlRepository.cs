using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IUserRoleSqlRepository : IGenericSqlRepository<UserRole, int>
    {
        Task<List<string>?> GetPermissionKeysByUserIdAsync(int userId, CancellationToken cancellationToken);
    }
}
