using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class AppointmentSqlRepository : GenericSqlRepository<Appointment, int>, IAppointmentSqlRepository
    {
        public AppointmentSqlRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<int> CountCompletedAsync(
            int staffId,
            int scheduleId,
            DateOnly appointmentDate,
            CancellationToken cancellationToken = default)
        {
            return AsQueryable()
                .Where(x => x.StaffId == staffId
                    && x.ScheduleId == scheduleId
                    && x.AppointmentDate == appointmentDate
                    && x.Status == AppointmentConst.STATUS_COMPLETED)
                .CountAsync(cancellationToken);
        }
    }
}
