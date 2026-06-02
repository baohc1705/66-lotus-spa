using Microsoft.EntityFrameworkCore;
using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Extensions
{
    public static class QueryableExtensions
    {
        public static async Task<PagedResult<T>> ToPagedAsync<T>(
            this IQueryable<T> query,
            PageRequest page,
            CancellationToken cancellationToken = default) where T : class
        {
            int total = await query.CountAsync(cancellationToken);
            if (total == 0)
                return new PagedResult<T>
                {
                    PageIndex = page.PageIndex,
                    PageSize = page.PageSize,
                    Items = new List<T>(),
                    TotalCount = 0
                };

            var items = await query
                .Skip((page.PageIndex - 1) * page.PageSize)
                .Take(page.PageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<T>
            {
                Items = items,
                TotalCount = total,
                PageIndex = page.PageIndex,
                PageSize = page.PageSize
            };
        }
    }
}
