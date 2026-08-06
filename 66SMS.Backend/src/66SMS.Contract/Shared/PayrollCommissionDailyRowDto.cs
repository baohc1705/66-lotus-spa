namespace _66SMS.Contracts.Shared
{
    /// <summary>
    /// Dòng từ usp_GetPayrollCommissionDailyStats (view tháng).
    /// </summary>
    public class PayrollCommissionDailyRowDto
    {
        public DateOnly WorkDate { get; set; }
        public int OrderCount { get; set; }
        public decimal ServiceHours { get; set; }
        public decimal TotalCommission { get; set; }
    }
}
