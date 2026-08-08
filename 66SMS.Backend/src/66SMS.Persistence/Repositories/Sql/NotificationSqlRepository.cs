using _66SMS.Contract.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class NotificationSqlRepository : GenericSqlRepository<Notification, int>, INotificationSqlRepository
    {
        public NotificationSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task SaveForUsersAsync(
            IReadOnlyList<int> userIds,
            string domain,
            string eventType,
            string title,
            string message,
            int? salonId,
            string? payloadJson,
            CancellationToken cancellationToken = default)
        {
            if (userIds.Count == 0) return;

            var now = DateTimeHelper.UtcNow();
            var rows = userIds
                .Distinct()
                .Select(userId => new Notification
                {
                    UserId = userId,
                    SalonId = salonId,
                    Domain = domain,
                    EventType = eventType,
                    Title = title,
                    Message = message,
                    PayloadJson = payloadJson,
                    IsRead = false,
                    CreatedAt = now,
                })
                .ToList();

            AddRange(rows);
            await SaveChangeAsync(cancellationToken);
        }

        public Task<int> MarkAllReadByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            return Entities
                .Where(x => x.UserId == userId && !x.IsRead)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(x => x.IsRead, true),
                    cancellationToken);
        }

        public Task<int> ClearByUserAsync(int userId, CancellationToken cancellationToken = default)
        {
            return Entities
                .Where(x => x.UserId == userId)
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}
