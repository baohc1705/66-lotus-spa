using _66SMS.Domain.Abstractions.Repositories.Sql;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace _66SMS.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Job đánh dấu soft lock ACTIVE đã quá ExpiresAt thành EXPIRED —
    /// cần để filtered unique index nhả (staff, date, slot) sau TTL.
    /// </summary>
    [DisallowConcurrentExecution]
    public class CleanupExpiredSlotLocksJob : IJob
    {
        private readonly IServiceScopeFactory scopeFactory;
        private readonly ILogger<CleanupExpiredSlotLocksJob> logger;

        public CleanupExpiredSlotLocksJob(
            IServiceScopeFactory scopeFactory,
            ILogger<CleanupExpiredSlotLocksJob> logger)
        {
            this.scopeFactory = scopeFactory;
            this.logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = scopeFactory.CreateScope();
            var lockRepository = scope.ServiceProvider
                .GetRequiredService<IAppointmentSlotLockSqlRepository>();

            var expired = await lockRepository.ExpireExpiredAsync(context.CancellationToken);

            if (expired > 0)
                logger.LogInformation("Đã đánh dấu {Count} soft lock hết hạn thành EXPIRED.", expired);
            else
                logger.LogDebug("Không có soft lock hết hạn cần dọn.");
        }
    }
}
