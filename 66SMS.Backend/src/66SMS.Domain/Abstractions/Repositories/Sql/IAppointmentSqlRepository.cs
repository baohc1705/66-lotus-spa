using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IAppointmentSqlRepository : IGenericSqlRepository<Appointment, int>
    {
        Task<int> CountCompletedAsync(
            int staffId,
            int scheduleId,
            DateOnly appointmentDate,
            CancellationToken cancellationToken = default);
    }
}
