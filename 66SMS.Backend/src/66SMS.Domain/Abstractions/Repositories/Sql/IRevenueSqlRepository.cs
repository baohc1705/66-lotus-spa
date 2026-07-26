using _66SMS.Contracts.Shared;

namespace _66SMS.Domain.Abstractions.Repositories.Sql
{
    public interface IRevenueSqlRepository
    {
        Task<IReadOnlyList<RevenueSummaryRowDto>> GetSummaryAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            bool comparePrevious,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RevenueTrendRowDto>> GetTrendAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RevenueBreakdownRowDto>> GetBreakdownAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<TopRevenueItemRowDto>> GetTopItemsAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            int itemType,
            int limit,
            CancellationToken cancellationToken = default);

        Task<TodaySummaryRowDto?> GetTodaySummaryAsync(
            int? salonId,
            DateOnly today,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<LabelValueRowDto>> GetCustomerTrafficAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            byte tab,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<LabelValueRowDto>> GetNetRevenueAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            byte tab,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<TopStaffRowDto>> GetTopStaffAsync(
            int? salonId,
            DateOnly fromDate,
            DateOnly toDate,
            int limit,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RevenueBySalonRowDto>> GetBySalonAsync(
            DateOnly fromDate,
            DateOnly toDate,
            bool comparePrevious,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyList<RevenueBySalonDailyRowDto>> GetBySalonDailyAsync(
            DateOnly fromDate,
            DateOnly toDate,
            CancellationToken cancellationToken = default);
    }
}
