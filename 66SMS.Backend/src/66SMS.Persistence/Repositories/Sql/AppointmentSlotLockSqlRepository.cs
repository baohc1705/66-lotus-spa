using _66SMS.Contract.Helpers;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class AppointmentSlotLockSqlRepository : GenericSqlRepository<AppointmentSlotLock, int>, IAppointmentSlotLockSqlRepository
    {
        public AppointmentSlotLockSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<int> ExpireExpiredAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTimeHelper.UtcNow();
            return Entities
                .Where(x => x.Status == AppointmentSlotLockConst.STATUS_ACTIVE && x.ExpiresAt <= now)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(x => x.Status, AppointmentSlotLockConst.STATUS_EXPIRED),
                    cancellationToken);
        }
    }
}
