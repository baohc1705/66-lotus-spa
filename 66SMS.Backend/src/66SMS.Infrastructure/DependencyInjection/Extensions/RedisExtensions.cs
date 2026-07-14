using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Infrastructure.Caching;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    public static class RedisExtensions
    {
        
        public static IServiceCollection AddRedisCache(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure RedisSettings từ configuration.
            services.Configure<RedisSettings>(configuration.GetSection(RedisSettings.SectionName));

            // Lấy RedisSettings từ configuration.
            var redisSettings = configuration.GetSection(RedisSettings.SectionName).Get<RedisSettings>()
                ?? new RedisSettings();

            // Tạo connection string cho Redis.
            var connectionString = redisSettings.ConnectionString;

            // Nếu connection string không chứa abortConnect, thêm vào.
            if (!connectionString.Contains("abortConnect", StringComparison.OrdinalIgnoreCase))
            {
                connectionString = $"{connectionString},abortConnect=false";
            }

            // Configure StackExchangeRedisCache.
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = connectionString;
                options.InstanceName = redisSettings.InstanceName;
            });

            // Add ConnectionMultiplexer.
            services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(connectionString));

            // Add CacheService.
            services.AddSingleton<ICacheService, RedisCacheService>();

            // Add RateLimitService.
            services.AddSingleton<IRateLimitService, RedisRateLimitService>();

            return services;
        }
    }
}
