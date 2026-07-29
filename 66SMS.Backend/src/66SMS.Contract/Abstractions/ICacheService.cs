namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Cache phân tán (Redis). Chỉ cache Data DTO, không cache Result
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Lấy dữ liệu từ cache.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu.</typeparam>
        /// <param name="key">Khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        Task<T?> GetAsync<T>(string key, CancellationToken ct = default);

        /// <summary>
        /// Lưu dữ liệu vào cache.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu.</typeparam>
        /// <param name="key">Khóa cache.</param>
        /// <param name="value">Giá trị cần lưu.</param>
        /// <param name="ttl">Thời gian tồn tại của cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default);

        /// <summary>
        /// Xóa dữ liệu từ cache.
        /// </summary>
        /// <param name="key">Khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        Task RemoveAsync(string key, CancellationToken ct = default);

        /// <summary>
        /// Xóa dữ liệu từ cache theo prefix.
        /// </summary>
        /// <param name="prefix">Prefix của khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);
    }
}
