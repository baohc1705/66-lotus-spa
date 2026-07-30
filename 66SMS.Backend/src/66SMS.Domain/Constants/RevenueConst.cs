namespace _66SMS.Domain.Constants
{
    public class RevenueConst
    {
        #region Store Procedure
        public const string SpSummary = "dbo.usp_GetRevenueSummary";
        public const string SpTrend = "dbo.usp_GetRevenueTrend";
        public const string SpBreakdown = "dbo.usp_GetRevenueBreakdown";
        public const string SpTopItems = "dbo.usp_GetTopRevenueItems";
        public const string SpToday = "dbo.usp_GetTodaySummary";
        public const string SpTraffic = "dbo.usp_GetCustomerTraffic";
        public const string SpNetRevenue = "dbo.usp_GetNetRevenue";
        public const string SpTopStaff = "dbo.usp_GetTopStaff";
        public const string SpBySalon = "dbo.usp_GetRevenueBySalon";
        public const string SpBySalonDaily = "dbo.usp_GetRevenueBySalonDaily";
        public const string SpByStaff = "dbo.usp_GetRevenueByStaff";
        public const string SpByService = "dbo.usp_GetRevenueByService";
        public const string SpReportByPeriod = "dbo.usp_GetReportRevenueByPeriod";
        public const string SpReportBySalon = "dbo.usp_GetReportRevenueBySalon";
        public const string SpReportByStaff = "dbo.usp_GetReportRevenueByStaff";
        public const string SpReportByService = "dbo.usp_GetReportRevenueByService";
        #endregion
        public const string MSG_INVALID_DATE_RANGE = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.";
        public const string MSG_INVALID_TAB = "Tab không hợp lệ. Dùng hour, day hoặc date.";
        public const string MSG_INVALID_ITEM_TYPE = "Loại item không hợp lệ. Dùng service hoặc product.";
        public const string MSG_SALON_REQUIRED = "Vui lòng chọn chi nhánh để xuất báo cáo.";
        public const string MSG_SALON_FORBIDDEN = "Bạn chỉ được xuất báo cáo doanh thu của chi nhánh mình quản lý.";
        public const string MSG_SALON_NOT_FOUND = "Không tìm thấy chi nhánh.";
        public const string MSG_INVALID_GRAIN = "Grain không hợp lệ. Dùng day, week, month, quarter hoặc year.";
    }
}
