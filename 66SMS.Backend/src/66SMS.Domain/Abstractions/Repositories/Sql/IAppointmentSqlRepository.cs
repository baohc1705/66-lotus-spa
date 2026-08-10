using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Models;

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

        Task<IReadOnlyList<BookingTechnicianRowDto>> GetBookingTechniciansAsync(
            DateOnly date,
            int serviceId,
            int? salonId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<BookingTimeSlotRowDto>> GetBookingTimeSlotsAsync(
            DateOnly date,
            int serviceId,
            int? staffId,
            int? salonId,
            CancellationToken cancellationToken = default);

        Task<ResolveBookingStaffRowDto?> ResolveBookingStaffAsync(
            DateOnly date,
            int serviceId,
            int slotId,
            int? staffId,
            int? salonId,
            int? excludeLockId,
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
