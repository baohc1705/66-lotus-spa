using _66SMS.Contracts.Abstractions;
using System.Data;
using System.Linq.Expressions;

namespace _66SMS.Domain.Abstractions.Repositories.Sql.Base
{
    public interface IGenericSqlRepository<TEntity, TKey> where TEntity : class
    {
        // Fluent query entry point
        IQuery<TEntity> Query(bool asNoTracking = true, bool isDeleted = false);

        Task<TEntity?> GetByIdAsync(TKey id, bool asNoTracking = true, bool isDeleted = true, CancellationToken cancellationToken = default);
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);

        #region Write
        void Add(TEntity entity);
        void AddRange(List<TEntity> entities);
        void Update(TEntity entity);
        void Remove(TEntity entity);
        void RemoveRange(List<TEntity> entity);
        void SoftRemove(TEntity entity);
        void SoftRemoveRange(List<TEntity> entities);
        #endregion

        #region Transaction
        Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
        Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
        #endregion
    }
}
