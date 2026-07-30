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

        byte[] BuildReportByPeriodWorkbook(
            DateOnly from,
            DateOnly to,
            string grain,
            IReadOnlyList<ReportRevenueByPeriodRowDto> rows);

        byte[] BuildReportBySalonWorkbook(
            DateOnly from,
            DateOnly to,
            IReadOnlyList<ReportRevenueBySalonRowDto> rows);

        byte[] BuildReportByStaffWorkbook(
            DateOnly from,
            DateOnly to,
            string? salonLabel,
            IReadOnlyList<ReportRevenueByStaffRowDto> rows);

        byte[] BuildReportByServiceWorkbook(
            DateOnly from,
            DateOnly to,
            string? salonLabel,
            IReadOnlyList<ReportRevenueByServiceRowDto> rows);
    }
}
