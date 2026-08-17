using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Models;
using _66SMS.Persistence.Repositories.Sql.Base;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class AppointmentSqlRepository : GenericSqlRepository<Appointment, int>, IAppointmentSqlRepository
    {
        private readonly ApplicationDbContext applicationDbContext;
        public AppointmentSqlRepository(ApplicationDbContext context) : base(context)
        {
            applicationDbContext = context;
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

        private static string JoinServiceIds(IReadOnlyList<int> serviceIds)
        {
            if (serviceIds == null || serviceIds.Count == 0)
                return string.Empty;
            return string.Join(",", serviceIds);
        }

        public async Task<IReadOnlyList<StaffAvailabilityRowDto>> GetStaffAvailabilityAsync(
            DateOnly workDate,
            IReadOnlyList<int> serviceIds,
            int? salonId,
            TimeOnly startTime,
            CancellationToken cancellationToken = default)
        {
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            object startTimeParam = startTime.ToTimeSpan();
            var serviceIdsCsv = JoinServiceIds(serviceIds);
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<StaffAvailabilityRowDto>(
                AppointmentConst.SP_GET_STAFF_AVAILABILITY,
                cancellationToken,
                workDate,
                serviceIdsCsv,
                salonParam,
                startTimeParam);
            return rows.ToList();
        }

        public async Task<IReadOnlyList<BookingTechnicianRowDto>> GetBookingTechniciansAsync(
            DateOnly date,
            IReadOnlyList<int> serviceIds,
            int? salonId,
            CancellationToken cancellationToken = default)
        {
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            var serviceIdsCsv = JoinServiceIds(serviceIds);
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<BookingTechnicianRowDto>(
                AppointmentConst.SP_GET_BOOKING_TECHNICIANS,
                cancellationToken,
                date,
                serviceIdsCsv,
                salonParam);
            return rows.ToList();
        }

        public async Task<IReadOnlyList<BookingTimeSlotRowDto>> GetBookingTimeSlotsAsync(
            DateOnly date,
            IReadOnlyList<int> serviceIds,
            int? staffId,
            int? salonId,
            CancellationToken cancellationToken = default)
        {
            object staffParam = staffId.HasValue ? staffId.Value : DBNull.Value;
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            var serviceIdsCsv = JoinServiceIds(serviceIds);
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<BookingTimeSlotRowDto>(
                AppointmentConst.SP_GET_BOOKING_TIME_SLOTS,
                cancellationToken,
                date,
                serviceIdsCsv,
                staffParam,
                salonParam);
            return rows.ToList();
        }

        public async Task<ResolveBookingStaffRowDto?> ResolveBookingStaffAsync(
            DateOnly date,
            IReadOnlyList<int> serviceIds,
            int? staffId,
            int? salonId,
            int? excludeLockId,
            int? excludeAppointmentId = null,
            TimeOnly? startTime = null,
            CancellationToken cancellationToken = default)
        {
            object staffParam = staffId.HasValue ? staffId.Value : DBNull.Value;
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            object excludeLockParam = excludeLockId.HasValue ? excludeLockId.Value : DBNull.Value;
            object excludeApptParam = excludeAppointmentId.HasValue ? excludeAppointmentId.Value : DBNull.Value;
            object startTimeParam = startTime.HasValue ? startTime.Value.ToTimeSpan() : DBNull.Value;
            var serviceIdsCsv = JoinServiceIds(serviceIds);
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<ResolveBookingStaffRowDto>(
                AppointmentConst.SP_RESOLVE_BOOKING_STAFF,
                cancellationToken,
                date,
                serviceIdsCsv,
                staffParam,
                salonParam,
                excludeLockParam,
                excludeApptParam,
                startTimeParam);
            return rows.FirstOrDefault();
        }

        public async Task<IReadOnlyList<CashierStaffColumnRowDto>> GetCashierStaffColumnsAsync(
            int? salonId,
            CancellationToken cancellationToken = default)
        {
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<CashierStaffColumnRowDto>(
                AppointmentConst.SP_GET_CASHIER_STAFF_COLUMNS,
                cancellationToken,
                salonParam);
            return rows.ToList();
        }

        public async Task<IReadOnlyList<CashierDailyBookingRowDto>> GetCashierDailyBookingsAsync(
            DateOnly fromDate,
            DateOnly toDate,
            int? salonId,
            CancellationToken cancellationToken = default)
        {
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<CashierDailyBookingRowDto>(
                AppointmentConst.SP_GET_CASHIER_DAILY_BOOKINGS,
                cancellationToken,
                fromDate,
                toDate,
                salonParam);
            return rows.ToList();
        }
    }
}
