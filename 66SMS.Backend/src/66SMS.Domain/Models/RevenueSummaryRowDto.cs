namespace _66SMS.Domain.Models
{
    /// <summary>Flat row từ usp_GetRevenueSummary.</summary>
    public class RevenueSummaryRowDto
    {
        public string PeriodTag { get; set; } = string.Empty;
        public decimal CashIn { get; set; }
        public decimal CashOut { get; set; }
        public decimal GrossRevenue { get; set; }
        public int TransactionCount { get; set; }
    }
}
