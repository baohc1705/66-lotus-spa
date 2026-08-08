namespace _66SMS.Contract.Shared
{
    public class ReportRevenueBySalonRowDto
    {
        public int SalonId { get; set; }
        public string SalonName { get; set; } = null!;
        public int StaffCount { get; set; }
        public int OrderCount { get; set; }
        public decimal CashIn { get; set; }
        public decimal CommissionOut { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
