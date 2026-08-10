namespace _66SMS.Domain.Models
{
    /// <summary>Flat row từ usp_GetRevenueBySalon.</summary>
    public class RevenueBySalonRowDto
    {
        public string PeriodTag { get; set; } = string.Empty;
        public int SalonId { get; set; }
        public string SalonCode { get; set; } = string.Empty;
        public string SalonName { get; set; } = string.Empty;
        public decimal CashIn { get; set; }
        public decimal CashOut { get; set; }
        public decimal GrossRevenue { get; set; }
        public int TransactionCount { get; set; }
    }
}
