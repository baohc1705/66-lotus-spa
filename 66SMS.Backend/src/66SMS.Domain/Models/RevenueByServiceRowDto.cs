namespace _66SMS.Domain.Models
{
    /// <summary>Flat row từ usp_GetRevenueByService.</summary>
    public class RevenueByServiceRowDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }
}
