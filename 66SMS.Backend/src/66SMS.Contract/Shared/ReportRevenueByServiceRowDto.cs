namespace _66SMS.Contracts.Shared
{
    public class ReportRevenueByServiceRowDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public decimal AvgCommissionRate { get; set; }
        public decimal Revenue { get; set; }
        public decimal Commission { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
