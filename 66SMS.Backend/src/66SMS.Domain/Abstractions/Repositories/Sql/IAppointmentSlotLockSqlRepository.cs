using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IAppointmentSlotLockSqlRepository : IGenericSqlRepository<AppointmentSlotLock, int>
    {
        /// <summary>
        /// Đánh dấu lock ACTIVE đã hết ExpiresAt thành EXPIRED. Trả về số bản ghi cập nhật.
        /// </summary>
        Task<int> ExpireExpiredAsync(CancellationToken cancellationToken = default);
    }
}
