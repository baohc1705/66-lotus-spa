using _66SMS.Contracts.Shared;
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

        Task<IReadOnlyList<StaffAvailabilityRowDto>> GetStaffAvailabilityAsync(
            DateOnly workDate,
            int slotId,
            int serviceId,
            int? salonId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CashierStaffColumnRowDto>> GetCashierStaffColumnsAsync(
            int? salonId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<CashierDailyBookingRowDto>> GetCashierDailyBookingsAsync(
            DateOnly fromDate,
            DateOnly toDate,
            int? salonId,
            CancellationToken cancellationToken = default);
    }
}
