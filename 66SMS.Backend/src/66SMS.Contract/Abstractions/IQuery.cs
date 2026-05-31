using _66SMS.Contracts.Shared;
using System.Linq.Expressions;

namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Phương thức build query động
    /// </summary>
    /// <typeparam name="TEntity"></typeparam>
    public interface IQuery<TEntity> where TEntity : class
    {
        // Filter 
        IQuery<TEntity> Where(Expression<Func<TEntity, bool>> predicate);

        // Include - tự động dùng EF .Include().ThenInclude() bên trong Func
        IQuery<TEntity> Include(Func<IQueryable<TEntity>, IQueryable<TEntity>> includeFunc);

        // --Order--
        // Tìm kiếm theo key tăng dần
        IQuery<TEntity> OrderBy(Expression<Func<TEntity, object>> keySelector, bool isDescending = false);
        // --Execute--
        // Tìm kiếm phần tử
        Task<TEntity?> FirstOrDefaultAsync(CancellationToken cancellationToken = default);
        // Lấy danh sách
        Task<List<TEntity>> ToListAsync(CancellationToken cancellationToken = default);
        // Lấy dạng pagination
        Task<PagedResult<TEntity>> ToPagedAsync(PageRequest page, CancellationToken cancellationToken = default);
        // Kiểm tra tồn tại
        Task<bool> AnyAsync(CancellationToken cancellationToken = default);
        // Đếm phần từ
        Task<int> CountAsync(CancellationToken cancellationToken = default);
    }
}
