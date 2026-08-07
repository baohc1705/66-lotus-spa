namespace _66SMS.Contracts.Shared
{
    public class ReportRevenueByStaffRowDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public int ServiceCount { get; set; }
        public decimal ServiceRevenue { get; set; }
        public decimal Commission { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
