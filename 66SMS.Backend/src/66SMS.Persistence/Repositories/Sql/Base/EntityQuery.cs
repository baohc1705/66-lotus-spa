using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace _66SMS.Persistence.Repositories.Sql.Base
{
    public class EntityQuery<TEntity> : IQuery<TEntity> where TEntity : class
    {
        private IQueryable<TEntity> query;
        public EntityQuery(IQueryable<TEntity> query)
        {
            this.query = query;
        }

        public IQuery<TEntity> Where(Expression<Func<TEntity, bool>> predicate)
        {
            query = query.Where(predicate);
            return this;
        }
        public IQuery<TEntity> Include(Func<IQueryable<TEntity>, IQueryable<TEntity>> includeFunc)
        {
            query = includeFunc(query);
            return this;
        }

        public IQuery<TEntity> OrderBy(Expression<Func<TEntity, object>> keySelector, bool isDescending = false)
        {
            query = !isDescending ? query.OrderBy(keySelector) : query.OrderByDescending(keySelector);
            return this;
        }
        public async Task<TEntity?> FirstOrDefaultAsync(CancellationToken cancellationToken = default)
        {
            return await query.FirstOrDefaultAsync(cancellationToken);
        }
        public async Task<List<TEntity>> ToListAsync(CancellationToken cancellationToken = default)
        {
            return await query.ToListAsync(cancellationToken);
        }
        public async Task<PagedResult<TEntity>> ToPagedAsync(PageRequest page, CancellationToken cancellationToken = default)
        {
            // Count tren query chia skip/take
            int total = await query.CountAsync(cancellationToken);
            if (total == 0)
                return new PagedResult<TEntity>
                {
                    PageIndex = page.PageIndex,
                    PageSize = page.PageSize,
                };
            var items = await query
                .Skip((page.PageIndex - 1) * page.PageSize)
                .Take(page.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<TEntity>
            {
                Items = items,
                TotalCount = total,
                PageIndex = page.PageIndex,
                PageSize = page.PageSize
            };
        }
        public async Task<bool> AnyAsync(CancellationToken cancellationToken = default)
        {
            return await query.AnyAsync(cancellationToken);
        }

        public async Task<int> CountAsync(CancellationToken cancellationToken = default)
        {
            return await query.CountAsync(cancellationToken);
        }

        
    }
}
