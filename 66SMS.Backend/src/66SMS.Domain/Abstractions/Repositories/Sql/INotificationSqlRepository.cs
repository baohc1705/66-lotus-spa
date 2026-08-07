using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface INotificationSqlRepository : IGenericSqlRepository<Notification, int>
    {
        Task SaveForUsersAsync(
            IReadOnlyList<int> userIds,
            string domain,
            string eventType,
            string title,
            string message,
            int? salonId,
            string? payloadJson,
            CancellationToken cancellationToken = default);

        Task<int> MarkAllReadByUserAsync(int userId, CancellationToken cancellationToken = default);

        Task<int> ClearByUserAsync(int userId, CancellationToken cancellationToken = default);
    }
}
