using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Persistence.Repositories.Sql.Base;

namespace _66SMS.Persistence.Repositories.Sql
{
    public class RevenueSqlRepository : IRevenueSqlRepository
    {
        private const string SpSummary = "dbo.usp_GetRevenueSummary";
        private const string SpTrend = "dbo.usp_GetRevenueTrend";
        private const string SpBreakdown = "dbo.usp_GetRevenueBreakdown";
        private const string SpTopItems = "dbo.usp_GetTopRevenueItems";
        private const string SpToday = "dbo.usp_GetTodaySummary";
        private const string SpTraffic = "dbo.usp_GetCustomerTraffic";
        private const string SpNetRevenue = "dbo.usp_GetNetRevenue";
        private const string SpTopStaff = "dbo.usp_GetTopStaff";
        private const string SpBySalon = "dbo.usp_GetRevenueBySalon";
        private const string SpBySalonDaily = "dbo.usp_GetRevenueBySalonDaily";

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
                SpSummary,
                cancellationToken,
                salonId,
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
                SpTrend,
                cancellationToken,
                salonId,
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
                SpBreakdown,
                cancellationToken,
                salonId,
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
                SpTopItems,
                cancellationToken,
                salonId,
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
                SpToday,
                cancellationToken,
                salonId,
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
                SpTraffic,
                cancellationToken,
                salonId,
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
                SpNetRevenue,
                cancellationToken,
                salonId,
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
                SpTopStaff,
                cancellationToken,
                salonId,
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
                SpBySalon,
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
                SpBySalonDaily,
                cancellationToken,
                fromDate,
                toDate);

            return rows.ToList();
        }
    }
}
