using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class RevenueSqlRepository : IRevenueSqlRepository
    {
        private readonly ApplicationDbContext dbContext;

        public RevenueSqlRepository(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public async Task<IReadOnlyList<RevenueSummaryRowDto>> GetSummaryAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            bool comparePrevious,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueSummaryRowDto>(
                RevenueConst.SpSummary,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                comparePrevious);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueTrendRowDto>> GetTrendAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueTrendRowDto>(
                RevenueConst.SpTrend,
                cancellationToken,
                salonId!,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueBreakdownRowDto>> GetBreakdownAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueBreakdownRowDto>(
                RevenueConst.SpBreakdown,
                cancellationToken,
                salonId!,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<TopRevenueItemRowDto>> GetTopItemsAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            int itemType,
            int limit,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<TopRevenueItemRowDto>(
                RevenueConst.SpTopItems,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                itemType,
                limit);

            return rows.ToList();
        }

        public async Task<TodaySummaryRowDto?> GetTodaySummaryAsync(
            int? salonId,
            DateOnly today,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<TodaySummaryRowDto>(
                RevenueConst.SpToday,
                cancellationToken,
                salonId!,
                today);

            return rows.FirstOrDefault();
        }

        public async Task<IReadOnlyList<LabelValueRowDto>> GetCustomerTrafficAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            byte tab,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<LabelValueRowDto>(
                RevenueConst.SpTraffic,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                tab);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<LabelValueRowDto>> GetNetRevenueAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            byte tab,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<LabelValueRowDto>(
                RevenueConst.SpNetRevenue,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                tab);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<TopStaffRowDto>> GetTopStaffAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            int limit,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<TopStaffRowDto>(
                RevenueConst.SpTopStaff,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                limit);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueBySalonRowDto>> GetBySalonAsync(
            DateOnly fromDate,
            DateOnly toDate,
            bool comparePrevious,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueBySalonRowDto>(
                RevenueConst.SpBySalon,
                cancellationToken,
                fromDate,
                toDate,
                comparePrevious);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueBySalonDailyRowDto>> GetBySalonDailyAsync(
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueBySalonDailyRowDto>(
                RevenueConst.SpBySalonDaily,
                cancellationToken,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueByStaffRowDto>> GetByStaffAsync(
            int salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueByStaffRowDto>(
                RevenueConst.SpByStaff,
                cancellationToken,
                salonId,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<RevenueByServiceRowDto>> GetByServiceAsync(
            int salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<RevenueByServiceRowDto>(
                RevenueConst.SpByService,
                cancellationToken,
                salonId,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<ReportRevenueByPeriodRowDto>> GetReportByPeriodAsync(
            int? salonId, 
            DateOnly fromDate, 
            DateOnly toDate, 
            string grain, 
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<ReportRevenueByPeriodRowDto>(
                RevenueConst.SpReportByPeriod,
                cancellationToken,
                salonId!,
                fromDate,
                toDate,
                grain);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<ReportRevenueBySalonRowDto>> GetReportBySalonAsync(
            DateOnly fromDate, 
            DateOnly toDate, 
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<ReportRevenueBySalonRowDto>(
                RevenueConst.SpReportBySalon,
                cancellationToken,
                fromDate,
                toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<ReportRevenueByStaffRowDto>> GetReportByStaffAsync(
            int? salonId, 
            DateOnly fromDate, 
            DateOnly toDate, 
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<ReportRevenueByStaffRowDto>(
               RevenueConst.SpReportByStaff,
               cancellationToken,
               salonId!,
               fromDate,
               toDate);

            return rows.ToList();
        }

        public async Task<IReadOnlyList<ReportRevenueByServiceRowDto>> GetReportByServiceAsync(
            int? salonId, 
            int? categoryId, 
            DateOnly fromDate, 
            DateOnly toDate, 
            CancellationToken cancellationToken = default)
        {
            var rows = await dbContext.ExecuteStoredProcedureAsync<ReportRevenueByServiceRowDto>(
               RevenueConst.SpReportByService,
               cancellationToken,
               salonId!, 
               categoryId!,
               fromDate,
               toDate);

            return rows.ToList();
        }
    }
}
