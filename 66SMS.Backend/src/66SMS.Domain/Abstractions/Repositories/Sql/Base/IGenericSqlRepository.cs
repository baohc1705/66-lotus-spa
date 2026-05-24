using _66SMS.Contracts.Shared;
using _66SMS.Contracts.Specifications;
using _66SMS.Domain.Abstractions.Entities.Base;
using System.Data;
using System.Linq.Expressions;

namespace _66SMS.Domain.Abstractions.Repositories.Sql.Base;

public interface IGenericSqlRepository<TEntity, TKey> where TEntity : class, IAuditTable<TKey>
{
    #region Read side
    IQueryable<TEntity> AsQueryable(bool asNoTracking = true);
    IQueryable<TEntity> FindAll(Expression<Func<TEntity, bool>>? predicate, bool asNoTracking = true, Func<IQueryable<TEntity>, IQueryable<TEntity>>? includes = null);
    Task<TEntity?> FindByIdAsync(TKey id, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes);
    Task<TEntity?> FindByIdAsync(TKey id, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<TDto?> FindByIdAsync<TDto>(TKey id, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes);
    Task<TEntity?> FindSingleAsync(Expression<Func<TEntity, bool>> predicate, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes);
    Task<TEntity?> FindSingleAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<TEntity?> FindSingleAsync(Specification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<TDto?> FindSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<TDto?> FindSingleAsync<TDto>(Specification<TEntity> specification, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> GetListAsync(Expression<Func<TEntity, bool>>? predicate = null, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes);
    Task<IReadOnlyList<TEntity>> GetListAsync(Expression<Func<TEntity, bool>>? predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> GetListAsync(Specification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<IReadOnlyList<TDto>> GetListAsync<TDto>(Expression<Func<TEntity, TDto>> selector, Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<IReadOnlyList<TDto>> GetListAsync<TDto>(Expression<Func<TEntity, TDto>> selector, Specification<TEntity>? specification = null, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<PagedResult<TEntity>> GetPagedAsync(int pageIndex,
                                             int pageSize,
                                             Expression<Func<TEntity, bool>>? predicate = null,
                                             Expression<Func<TEntity, object>>? orderBy = null,
                                             bool isDescending = false,
                                             bool asNoTracking = true,
                                             bool IsNotDeleted = true,
                                             CancellationToken ct = default,
                                             params Expression<Func<TEntity, object>>[] includes);

    Task<PagedResult<TEntity>> GetPagedIncludeAsync(int pageIndex,
                                             int pageSize,
                                             Expression<Func<TEntity, bool>>? predicate,
                                             Expression<Func<TEntity, object>>? orderBy,
                                             bool isDescending,
                                             Func<IQueryable<TEntity>, IQueryable<TEntity>>? include,
                                             bool asNoTracking = true,
                                             bool IsNotDeleted = true,
                                             CancellationToken ct = default);

    Task<PagedResult<TDto>> GetPagedAsync<TDto>(int pageIndex,
                                                int pageSize,
                                                Expression<Func<TEntity, TDto>> selector,
                                                Expression<Func<TEntity, bool>>? predicate = null,
                                                Expression<Func<TEntity, object>>? orderBy = null,
                                                bool isDescending = false,
                                                bool IsNotDeleted = true,
                                                CancellationToken ct = default,
                                                params Expression<Func<TEntity, object>>[] includesProperties) where TDto : class;

    Task<PagedResult<TEntity>> GetPagedAsync(PaginationSpecification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<PagedResult<TDto>> GetPagedAsync<TDto>(PaginationSpecification<TEntity> specification, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default) where TDto : class;
    Task<bool> ExistsAsync(Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default);
    Task<int> CountAsync(IEnumerable<Expression<Func<TEntity, bool>>> predicates, bool IsNotDeleted = true, CancellationToken ct = default);
    #endregion

    #region Write
    void Add(TEntity entity);
    void AddRange(IEnumerable<TEntity> entities);
    void Remove(TEntity entity);
    void RemoveRange(IEnumerable<TEntity> entities);
    void SoftRemove(TEntity entity);
    void SoftRemoveRange(IEnumerable<TEntity> entities);
    void Update(TEntity entity);
    #endregion

    #region Transaction
    Task<int> SaveChangeAsync(CancellationToken cancellationToken = default);
    Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    #endregion
}