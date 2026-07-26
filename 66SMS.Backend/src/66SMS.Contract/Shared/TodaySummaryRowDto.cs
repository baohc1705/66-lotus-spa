namespace _66SMS.Contracts.Shared
{
    /// <summary>Flat row từ usp_GetTodaySummary (1 dòng).</summary>
    public class TodaySummaryRowDto
    {
        public int AppointmentsTotal { get; set; }
        public int AppointmentsCompleted { get; set; }
        public int CompletionRate { get; set; }
        public int ChangeVsYesterday { get; set; }
        public int CustomersTotal { get; set; }
        public int NewCustomers { get; set; }
        public int ReturningCustomers { get; set; }
        public int LapsedCustomers { get; set; }
        public decimal GrossRevenue { get; set; }
        public decimal CashOut { get; set; }
        public decimal NetRevenue { get; set; }
    }
}
