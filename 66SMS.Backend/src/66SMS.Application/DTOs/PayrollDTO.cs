namespace _66SMS.Application.DTOs
{
    public class PayrollDTO
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public int? PeriodMonth { get; set; }
        public int? PeriodYear { get; set; }
        public int? SalaryType { get; set; }
        public decimal? Rate { get; set; }
        public decimal? TotalHours { get; set; }
        public decimal? TotalWorkDays { get; set; }
        public decimal? BaseAmount { get; set; }
        public decimal? CommissionAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public int? StandardWorkDays { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public string? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
