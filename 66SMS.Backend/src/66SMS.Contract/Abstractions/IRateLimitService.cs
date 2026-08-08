namespace _66SMS.Contract.Abstractions
{
    /// <summary>
    /// Rate limit dựa trên Redis sliding-window counter.
    /// </summary>
    public interface IRateLimitService
    {
        /// <summary>
        /// Kiểm tra còn trong hạn mức hay không.
        /// Fail-open: nếu Redis lỗi thì trả true (cho request qua).
        /// </summary>
        Task<bool> IsAllowedAsync(string key, int limit, TimeSpan window, CancellationToken ct = default);
    }
}
