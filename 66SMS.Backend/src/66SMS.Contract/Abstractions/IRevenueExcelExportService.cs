using _66SMS.Contracts.Shared;

namespace _66SMS.Contracts.Abstractions
{
    public interface IRevenueExcelExportService
    {
        byte[] BuildBySalonWorkbook(
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueBySalonRowDto> salonRows,
            IReadOnlyList<RevenueBySalonDailyRowDto> dailyRows);

        byte[] BuildBranchRevenueWorkbook(
            string salonName,
            DateOnly from,
            DateOnly to,
            IReadOnlyList<RevenueByStaffRowDto> staffRows,
            IReadOnlyList<RevenueByServiceRowDto> serviceRows);
    }
}
