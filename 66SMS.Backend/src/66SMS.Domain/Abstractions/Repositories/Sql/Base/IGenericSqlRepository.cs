using System.Data;
using System.Linq.Expressions;

namespace _66SMS.Domain.Abstractions.Repositories.Sql.Base
{
    public interface IGenericSqlRepository<TEntity, TKey> where TEntity : class
    {
        IQueryable<TEntity> AsQueryable(bool asNoTracking = true);

        Task<TEntity?> GetByIdAsync(TKey id, bool asNoTracking = true, CancellationToken cancellationToken = default);
        Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);

        #region Write
        void Add(TEntity entity);
        void AddRange(List<TEntity> entities);
        void Update(TEntity entity);
        void Remove(TEntity entity);
        void RemoveRange(List<TEntity> entity);
        #endregion

        #region Transaction
        Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
        Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
        #endregion
    }
}
