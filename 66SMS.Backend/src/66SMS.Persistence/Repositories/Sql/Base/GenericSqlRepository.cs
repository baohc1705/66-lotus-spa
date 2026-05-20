using _66SMS.Contracts.Shared;
using _66SMS.Contracts.Specifications;
using _66SMS.Domain.Abstractions.Entities.Base;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Persistence.Specifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Linq.Expressions;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class GenericSqlRepository<TEntity, TKey> : IGenericSqlRepository<TEntity, TKey> where TEntity : class, IAuditTable<TKey>
    {
        private readonly ApplicationDbContext context;
        private DbSet<TEntity>? entities;

        public GenericSqlRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        protected DbSet<TEntity> Entities
        {
            get
            {
                if (entities == null)
                    entities = context.Set<TEntity>();

                return entities;
            }
        }

        public IQueryable<TEntity> AsQueryable(bool asNoTracking = true)
        {
            return asNoTracking ? Entities.AsNoTracking() : Entities;
        }

        #region Find by id async

        public async Task<TEntity?> FindByIdAsync(TKey id, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (includes != null && includes.Any())
                query = includes.Aggregate(query, (current, include) => current.Include(include));

            return await query.FirstOrDefaultAsync(x => x.Id!.Equals(id), ct);
        }

        public async Task<TEntity?> FindByIdAsync(TKey id, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (include != null)
                query = include(query);

            return await query.FirstOrDefaultAsync(x => x.Id!.Equals(id), ct);
        }

        public async Task<TDto?> FindByIdAsync<TDto>(TKey id, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes)
        {
            var query = AsQueryable(true);

            query = query.Where(x => x.Id!.Equals(id));

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (includes != null && includes.Any())
                query = includes.Aggregate(query, (current, include) => current.Include(include));

            return await query.Select(selector).FirstOrDefaultAsync(ct);
        }

        #endregion

        #region Find single async

        public async Task<TEntity?> FindSingleAsync(Expression<Func<TEntity, bool>> predicate, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (includes != null && includes.Any())
                query = includes.Aggregate(query, (current, include) => current.Include(include));

            return await query.SingleOrDefaultAsync(predicate, ct);
        }

        public async Task<TEntity?> FindSingleAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (include != null)
                query = include(query);

            return await query.SingleOrDefaultAsync(predicate, ct);
        }

        public async Task<TEntity?> FindSingleAsync(Specification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = SpecificationEvaluator.Apply(AsQueryable(specification.AsNoTracking ?? asNoTracking), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return await query.SingleOrDefaultAsync(ct);
        }

        public async Task<TDto?> FindSingleAsync<TDto>(Expression<Func<TEntity, bool>> predicate, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return await query.Where(predicate).Select(selector).SingleOrDefaultAsync(ct);
        }

        public async Task<TDto?> FindSingleAsync<TDto>(Specification<TEntity> specification, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = SpecificationEvaluator.Apply(AsQueryable(specification.AsNoTracking ?? true), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return await query.Select(selector).SingleOrDefaultAsync(ct);
        }

        #endregion

        #region Get list async

        public async Task<IReadOnlyList<TEntity>> GetListAsync(Expression<Func<TEntity, bool>>? predicate = null, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[]? includes)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            if (includes != null && includes.Any())
                query = includes.Aggregate(query, (current, include) => current.Include(include));

            return await query.ToListAsync(ct);
        }

        public async Task<IReadOnlyList<TEntity>> GetListAsync(Expression<Func<TEntity, bool>>? predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            if (include != null)
                query = include(query);

            return await query.ToListAsync(ct);
        }

        public async Task<IReadOnlyList<TEntity>> GetListAsync(Specification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = SpecificationEvaluator.Apply(AsQueryable(specification.AsNoTracking ?? asNoTracking), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return await query.ToListAsync(ct);
        }

        public async Task<IReadOnlyList<TDto>> GetListAsync<TDto>(Expression<Func<TEntity, TDto>> selector, Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            return await query.Select(selector).ToListAsync(ct);
        }

        public async Task<IReadOnlyList<TDto>> GetListAsync<TDto>(Expression<Func<TEntity, TDto>> selector, Specification<TEntity>? specification = null, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = SpecificationEvaluator.Apply(AsQueryable(specification!.AsNoTracking ?? true), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return await query.Select(selector).ToListAsync(ct);
        }

        #endregion

        #region Get paged async

        public async Task<PagedResult<TEntity>> GetPagedAsync(int pageIndex, int pageSize, Expression<Func<TEntity, bool>>? predicate = null, Expression<Func<TEntity, object>>? orderBy = null, bool isDescending = false, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[] includes)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            if (includes != null && includes.Any())
                query = includes.Aggregate(query, (current, include) => current.Include(include));

            int totalCount = await query.CountAsync(ct);

            if (totalCount == 0)
            {
                return new PagedResult<TEntity>
                {
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                };
            }

            if (orderBy != null)
                query = isDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync(ct);

            return new PagedResult<TEntity>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize,
            };
        }

        public async Task<PagedResult<TEntity>> GetPagedAsync(int pageIndex, int pageSize, Expression<Func<TEntity, bool>>? predicate, Expression<Func<TEntity, object>>? orderBy, bool isDescending, Func<IQueryable<TEntity>, IQueryable<TEntity>>? include, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(asNoTracking);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            if (include != null)
                query = include(query);

            int totalCount = await query.CountAsync(ct);

            if (totalCount == 0)
            {
                return new PagedResult<TEntity>
                {
                    PageIndex = pageIndex,
                    PageSize = pageSize,
                };
            }

            if (orderBy != null)
                query = isDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);

            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync(ct);

            return new PagedResult<TEntity>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize,
            };
        }

        public async Task<PagedResult<TDto>> GetPagedAsync<TDto>(int pageIndex, int pageSize, Expression<Func<TEntity, TDto>> selector, Expression<Func<TEntity, bool>>? predicate = null, Expression<Func<TEntity, object>>? orderBy = null, bool isDescending = false, bool IsNotDeleted = true, CancellationToken ct = default, params Expression<Func<TEntity, object>>[] includesProperties) where TDto : class
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            int totalCount = await query.CountAsync(ct);

            if (totalCount == 0)
                return new PagedResult<TDto> { PageIndex = pageIndex, PageSize = pageSize };

            if (includesProperties != null && includesProperties.Any())
                query = includesProperties.Aggregate(query, (current, include) => current.Include(include));

            if (orderBy != null)
                query = isDescending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);



            var items = await query.Skip((pageIndex - 1) * pageSize).Take(pageSize).Select(selector).ToListAsync(ct);

            return new PagedResult<TDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize,
            };
        }

        public async Task<PagedResult<TEntity>> GetPagedAsync(PaginationSpecification<TEntity> specification, bool asNoTracking = true, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            long total = await CountBySpecAsync(specification, IsNotDeleted, ct);

            if (total == 0)
                return new PagedResult<TEntity> { PageIndex = specification.PageIndex, PageSize = specification.PageSize };

            var query = SpecificationEvaluator.Apply(AsQueryable(specification.AsNoTracking ?? asNoTracking), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return new PagedResult<TEntity>
            {
                Items = await query.ToListAsync(ct),
                TotalCount = total,
                PageIndex = specification.PageIndex,
                PageSize = specification.PageSize
            };
        }

        public async Task<PagedResult<TDto>> GetPagedAsync<TDto>(PaginationSpecification<TEntity> specification, Expression<Func<TEntity, TDto>> selector, bool IsNotDeleted = true, CancellationToken ct = default) where TDto : class
        {
            long total = await CountBySpecAsync(specification, IsNotDeleted, ct);

            if (total == 0)
                return new PagedResult<TDto> { PageIndex = specification.PageIndex, PageSize = specification.PageSize };

            var query = SpecificationEvaluator.Apply(AsQueryable(specification.AsNoTracking ?? true), specification);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            return new PagedResult<TDto>
            {
                Items = await query.Select(selector).ToListAsync(ct),
                TotalCount = total,
                PageIndex = specification.PageIndex,
                PageSize = specification.PageSize
            };
        }

        #endregion

        #region Count async

        private async Task<long> CountBySpecAsync(SpecificationBase<TEntity> spec, bool IsNotDeleted, CancellationToken ct)
        {
            var query = Entities.AsNoTracking();

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            foreach (var condition in spec.Conditions)
                query = query.Where(condition);

            return await query.LongCountAsync(ct);
        }

        public async Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            return await query.CountAsync(ct);
        }

        public async Task<int> CountAsync(IEnumerable<Expression<Func<TEntity, bool>>> predicates, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            foreach (var predicate in predicates)
                query = query.Where(predicate);

            return await query.CountAsync(ct);
        }

        #endregion

        #region Exists async

        public async Task<bool> ExistsAsync(Expression<Func<TEntity, bool>>? predicate = null, bool IsNotDeleted = true, CancellationToken ct = default)
        {
            var query = AsQueryable(true);

            if (IsNotDeleted)
                query = query.Where(x => !x.IsDeleted  );

            if (predicate != null)
                query = query.Where(predicate);

            return await query.AnyAsync(ct);
        }
        #endregion

        #region Write side
        public void Add(TEntity entity)
        {
            entity.CreatedAt = DateTime.UtcNow;
            Entities.Add(entity);
        }
        public void AddRange(IEnumerable<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
            Entities.AddRange(entities);
        }

        public void Remove (TEntity entity)
        {
            Entities.Remove(entity);
        }

        public void RemoveRange(IEnumerable<TEntity> entities)
        {
            Entities.RemoveRange(entities);
        }
        public void SoftRemove(TEntity entity)
        {
            entity.IsDeleted = true;
            entity.ModifiedAt = DateTime.UtcNow;
            Entities.Update(entity);
        }

        public void SoftRemoveRange(IEnumerable<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                entity.ModifiedAt = DateTime.UtcNow;
            }
            Entities.UpdateRange(entities);
        }

        public void Update(TEntity entity)
        {
            entity.ModifiedAt = DateTime.UtcNow;
            Entities.Update(entity);
        }
        #endregion

        #region Transaction
        public async Task<int> SaveChangeAsync(CancellationToken cancellationToken = default)
        {
            return await context.SaveChangesAsync(cancellationToken);
        }

        public async Task<IDbTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            var transaction = await context.Database.BeginTransactionAsync(cancellationToken);
            return transaction.GetDbTransaction();
        }

        #endregion

    }
}