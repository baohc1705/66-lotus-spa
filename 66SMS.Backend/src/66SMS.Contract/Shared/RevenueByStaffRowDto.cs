namespace _66SMS.Contract.Shared
{
    /// <summary>Flat row từ usp_GetRevenueByStaff.</summary>
    public class RevenueByStaffRowDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
        public decimal Commission { get; set; }
    }
}
