using System.Data;

namespace _66SMS.Domain.Abstractions.Repositories.Sql.Base
{
    public interface ISqlUnitOfWork
    {
        Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
        Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    }
}
