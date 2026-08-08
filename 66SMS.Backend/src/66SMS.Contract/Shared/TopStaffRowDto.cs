namespace _66SMS.Contract.Shared
{
    /// <summary>Flat row từ usp_GetTopStaff.</summary>
    public class TopStaffRowDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int Quantity { get; set; }
        public decimal Commission { get; set; }
        public int GrowthPercent { get; set; }
    }
}
