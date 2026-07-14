using System.Text.Json;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace _66SMS.Infrastructure.Caching
{
    /// <summary>
    /// Cache phân tán (Redis). Chỉ cache Data DTO, không cache Result&lt;T&gt;.
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        /// <summary>
        /// Options cho JsonSerializer.
        /// </summary>
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
        };

        /// <summary>
        /// Cache phân tán (Redis).
        /// </summary>
        private readonly IDistributedCache cache;
        /// <summary>
        /// ConnectionMultiplexer để lấy Server.
        /// </summary>
        private readonly IConnectionMultiplexer mux;
        /// <summary>
        /// Settings cho Redis.
        /// </summary>
        private readonly RedisSettings settings;
        /// <summary>
        /// Logger.
        /// </summary>
        private readonly ILogger<RedisCacheService> logger;

        public RedisCacheService(
            IDistributedCache cache,
            IConnectionMultiplexer mux,
            IOptions<RedisSettings> settings,
            ILogger<RedisCacheService> logger)
        {
            this.cache = cache;
            this.mux = mux;
            this.settings = settings.Value;
            this.logger = logger;
        }

        /// <summary>
        /// Lấy dữ liệu từ cache.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu.</typeparam>
        /// <param name="key">Khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
        {
            try
            {
                // Lấy dữ liệu từ cache.
                var json = await cache.GetStringAsync(key, ct);

                // Nếu không có dữ liệu, trả về default.
                if (string.IsNullOrEmpty(json))
                    return default;

                logger.LogInformation("Redis GET success for key {Key}", key);

                // Deserialize dữ liệu từ cache.
                var data = JsonSerializer.Deserialize<T>(json, JsonOptions);
                return data;
            }
            catch (Exception ex)
            {
                // Log lỗi.
                logger.LogWarning(ex, "Redis GET failed for key {Key}", key);
                return default;
            }
        }


        /// <summary>
        /// Lưu dữ liệu vào cache.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu.</typeparam>
        /// <param name="key">Khóa cache.</param>
        /// <param name="value">Giá trị cần lưu.</param>
        /// <param name="ttl">Thời gian tồn tại của cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken ct = default)
        {
            try
            {
                // Serialize dữ liệu.
                var json = JsonSerializer.Serialize(value, JsonOptions);

                // Tạo options cho cache.
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = ttl
                        ?? TimeSpan.FromMinutes(settings.DefaultTtlMinutes),
                };

                // Lưu dữ liệu vào cache.
                await cache.SetStringAsync(key, json, options, ct);

                logger.LogInformation("Redis SET success for key {Key}", key);
            }
            catch (Exception ex)
            {
                // Log lỗi.
                logger.LogWarning(ex, "Redis SET failed for key {Key}", key);
                throw;
            }
        }

        /// <summary>
        /// Xóa dữ liệu từ cache.
        /// </summary>
        /// <param name="key">Khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        public async Task RemoveAsync(string key, CancellationToken ct = default)
        {
            try
            {       
                // Xóa dữ liệu từ cache.
                await cache.RemoveAsync(key, ct);

                logger.LogInformation("Redis REMOVE success for key {Key}", key);
            }
            catch (Exception ex)
            {
                // Log lỗi.
                logger.LogWarning(ex, "Redis REMOVE failed for key {Key}", key);
            }
        }

        /// <summary>
        /// Xóa dữ liệu từ cache theo prefix.
        /// </summary>
        /// <param name="prefix">Prefix của khóa cache.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>Dữ liệu từ cache.</returns>
        public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
        {
            try
            {
                // Lấy Server từ ConnectionMultiplexer.
                var server = GetServer();

                // Nếu không có Server, trả về.
                if (server is null)
                    return;

                // Lấy Database từ ConnectionMultiplexer.
                var db = mux.GetDatabase();

                // Tạo pattern cho khóa cache.
                var pattern = $"{settings.InstanceName}{prefix}*";

                // Xóa dữ liệu từ cache theo pattern.
                await foreach (var key in server.KeysAsync(pattern: pattern).WithCancellation(ct))
                {
                    // IDistributedCache keys đã có InstanceName; KeyDelete cần full Redis key
                    await db.KeyDeleteAsync(key);
                }

                logger.LogInformation("Redis REMOVE BY PREFIX success for prefix {Prefix}", prefix);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Redis REMOVE BY PREFIX failed for prefix {Prefix}", prefix);
            }
        }

        /// <summary>
        /// Lấy Server từ ConnectionMultiplexer.
        /// </summary>
        /// <returns>Server từ ConnectionMultiplexer.</returns>
        private IServer? GetServer()
        {
            // Lấy endpoints từ ConnectionMultiplexer.
            var endpoints = mux.GetEndPoints();

            // Nếu không có endpoints, trả về null.
            if (endpoints.Length == 0)
                return null;

            // Lấy Server từ endpoints.
            return mux.GetServer(endpoints[0]);
        }
    }
}
