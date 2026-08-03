using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
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

        public async Task<IReadOnlyList<StaffAvailabilityRowDto>> GetStaffAvailabilityAsync(DateOnly workDate, int slotId, int serviceId, int? salonId, CancellationToken cancellationToken = default)
        {
            object salonParam = salonId.HasValue ? salonId.Value : DBNull.Value;
            var rows = await applicationDbContext.ExecuteStoredProcedureAsync<StaffAvailabilityRowDto>(AppointmentConst.SP_GET_STAFF_AVAILABILITY, cancellationToken, workDate, slotId, serviceId, salonParam);
            return rows.ToList();
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
