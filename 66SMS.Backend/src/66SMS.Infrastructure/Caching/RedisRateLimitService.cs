using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace _66SMS.Infrastructure.Caching
{
    /// <summary>
    /// Service để kiểm tra tốc độ request dựa trên Redis.
    /// </summary>
    public class RedisRateLimitService : IRateLimitService
    {
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
        private readonly ILogger<RedisRateLimitService> logger;

        /// <summary>
        /// Constructor.
        /// </summary>
        /// <param name="mux">ConnectionMultiplexer.</param>
        /// <param name="settings">Settings cho Redis.</param>
        /// <param name="logger">Logger.</param>
        public RedisRateLimitService(IConnectionMultiplexer mux, IOptions<RedisSettings> settings, ILogger<RedisRateLimitService> logger)
        {
            this.mux = mux;
            this.settings = settings.Value;
            this.logger = logger;
        }

        /// <summary>
        /// Kiểm tra còn trong hạn mức hay không.
        /// Fail-open: nếu Redis lỗi thì trả true (cho request qua).
        /// </summary>
        /// <param name="key">Khóa cache.</param>
        /// <param name="limit">Số lần request tối đa.</param>
        /// <param name="window">Thời gian hết hạn.</param>
        /// <param name="ct">CancellationToken.</param>
        /// <returns>True nếu còn trong hạn mức, false nếu ngược lại.</returns>
        public async Task<bool> IsAllowedAsync(string key, int limit, TimeSpan window, CancellationToken ct = default)
        {
            try
            {
                // Lấy Database từ ConnectionMultiplexer.
                var db = mux.GetDatabase();

                // Tạo khóa cache.
                var redisKey = $"{settings.InstanceName}ratelimit:{key}";

                // Tăng giá trị của khóa cache.
                var count = await db.StringIncrementAsync(redisKey);

                // Nếu giá trị là 1, set thời gian hết hạn cho khóa cache.
                if (count == 1)
                {
                    // Set thời gian hết hạn cho khóa cache.
                    await db.KeyExpireAsync(redisKey, window);
                }

                // Trả về true nếu số lần request nhỏ hơn hoặc bằng limit, false nếu ngược lại.
                return count <= limit;
            }
            catch (Exception ex)
            {
                // Fail-open: Redis down không chặn user
                logger.LogWarning(ex, "Redis rate limit failed for key {Key} — allowing request", key);

                // Trả về true để cho request qua.
                return true;
            }
        }
    }
}
