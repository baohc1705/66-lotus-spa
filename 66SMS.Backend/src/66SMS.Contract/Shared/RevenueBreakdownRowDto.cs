namespace _66SMS.Contracts.Shared
{
    /// <summary>Flat row từ usp_GetRevenueBreakdown.</summary>
    public class RevenueBreakdownRowDto
    {
        public int ItemType { get; set; }
        public string Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}
