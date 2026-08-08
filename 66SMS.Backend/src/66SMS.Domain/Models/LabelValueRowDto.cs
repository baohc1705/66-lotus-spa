namespace _66SMS.Domain.Models
{
    /// <summary>Flat row từ usp_GetCustomerTraffic / usp_GetNetRevenue.</summary>
    public class LabelValueRowDto
    {
        public string Label { get; set; } = string.Empty;
        public decimal Value { get; set; }
    }
}
