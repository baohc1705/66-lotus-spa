using _66SMS.Domain.Abstractions.Repositories.Sql;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace _66SMS.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Job dọn các refresh token đã bị revoke khỏi database.
    /// </summary>
    [DisallowConcurrentExecution]
    public class CleanupRevokedRefreshTokensJob : IJob
    {
        private readonly IServiceScopeFactory scopeFactory;
        private readonly ILogger<CleanupRevokedRefreshTokensJob> logger;

        public CleanupRevokedRefreshTokensJob(
            IServiceScopeFactory scopeFactory,
            ILogger<CleanupRevokedRefreshTokensJob> logger)
        {
            this.scopeFactory = scopeFactory;
            this.logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = scopeFactory.CreateScope();
            var refreshTokenRepository = scope.ServiceProvider
                .GetRequiredService<IRefreshTokenSqlRepository>();

            var deleted = await refreshTokenRepository.DeleteRevokedAsync(context.CancellationToken);

            if (deleted > 0)
                logger.LogInformation("Đã xóa {Count} refresh token đã revoke.", deleted);
            else
                logger.LogDebug("Không có refresh token đã revoke để xóa.");
        }
    }
}
