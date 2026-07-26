namespace _66SMS.Contracts.Shared
{
    /// <summary>Flat row từ usp_GetRevenueTrend.</summary>
    public class RevenueTrendRowDto
    {
        public DateOnly Date { get; set; }
        public decimal CashIn { get; set; }
        public decimal CashOut { get; set; }
    }
}
