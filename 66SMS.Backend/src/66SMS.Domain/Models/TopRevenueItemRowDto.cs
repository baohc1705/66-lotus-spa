namespace _66SMS.Domain.Models
{
    /// <summary>Flat row từ usp_GetTopRevenueItems.</summary>
    public class TopRevenueItemRowDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int ItemType { get; set; }
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }
}
