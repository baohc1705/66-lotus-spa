namespace _66SMS.Application.DTOs
{
    public class RevenueReportDto
    {
        public class ReportPeriodStatsDto
        {
            public decimal TotalRevenue { get; set; }
            public decimal TotalExpense { get; set; }
            public int OrderCount { get; set; }
            public decimal Profit { get; set; }
        }
        public class ReportSalonStatsDto
        {
            public decimal TotalRevenue { get; set; }
            public decimal TotalCollected { get; set; }
            public decimal TotalCommission { get; set; }
            public decimal Profit { get; set; }
        }

        public class ReportRevenueByPeriodItemDto
        {
            public string PeriodKey { get; set; } = string.Empty;
            public int OrderCount { get; set; }
            public decimal InvoiceTotal { get; set; }
            public decimal CommissionTotal { get; set; }
            public decimal TotalRevenue { get; set; }
        }

        public class ReportRevenueByPeriodDto
        {
            public ReportPeriodStatsDto Stats { get; set; } = new();
            public List<ReportRevenueByPeriodItemDto> Rows { get; set; } = new();
        }

        public class ReportRevenueBySalonItemDto
        {
            public int SalonId { get; set; }
            public string SalonName { get; set; } = string.Empty;
            public int StaffCount { get; set; }
            public int OrderCount { get; set; }
            public decimal CashIn { get; set; }
            public decimal CommissionOut { get; set; }
            public decimal TotalRevenue { get; set; }
        }

        public class ReportRevenueBySalonDto
        {
            public ReportSalonStatsDto Stats { get; set; } = new();
            public List<ReportRevenueBySalonItemDto> Rows { get; set; } = new();
        }

        public class ReportRevenueByStaffItemDto
        {
            public int StaffId { get; set; }
            public string StaffName { get; set; } = string.Empty;
            public int ServiceCount { get; set; }
            public decimal ServiceRevenue { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalRevenue { get; set; }
        }

        public class ReportRevenueByServiceItemDto
        {
            public int ItemId { get; set; }
            public string ItemName { get; set; } = string.Empty;
            public int Quantity { get; set; }
            public decimal AvgCommissionRate { get; set; }
            public decimal Revenue { get; set; }
            public decimal Commission { get; set; }
            public decimal TotalRevenue { get; set; }
        }
    }
}
