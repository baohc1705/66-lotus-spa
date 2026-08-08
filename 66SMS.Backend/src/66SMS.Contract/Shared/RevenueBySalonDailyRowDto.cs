namespace _66SMS.Contract.Shared
{
    /// <summary>Flat row từ usp_GetRevenueBySalonDaily.</summary>
    public class RevenueBySalonDailyRowDto
    {
        public DateOnly Date { get; set; }
        public int SalonId { get; set; }
        public string SalonName { get; set; } = string.Empty;
        public decimal GrossRevenue { get; set; }
    }
}
