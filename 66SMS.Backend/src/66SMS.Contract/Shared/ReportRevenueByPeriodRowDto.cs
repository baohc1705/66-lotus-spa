namespace _66SMS.Contracts.Shared
{
    public class ReportRevenueByPeriodRowDto
    {
        public string PeriodKey { get; set; }
        public int OrderCount { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal CommissionTotal { get; set; }
        public decimal CashOut { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
