namespace _66SMS.Contracts.Shared
{
    public class PagedResult<TEntity> where TEntity : class
    {
        public IReadOnlyList<TEntity> Items { get; set; } = [];
        public long TotalCount { get; init; }
        public int PageIndex { get; init; }
        public int PageSize { get; init; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPreviousPage => PageIndex > 1;
        public bool HasNextPage => PageIndex < TotalPages;
    }
}
