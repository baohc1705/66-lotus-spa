using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Payroll : EntityBase<int>
    {
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int PeriodMonth { get; set; }
        public int PeriodYear { get; set; }
        public int SalaryType { get; set; }
        public decimal Rate { get; set; }
        public decimal TotalHours { get; set; }
        public decimal TotalWorkDays { get; set; }
        public decimal BaseAmount { get; set; }
        public decimal CommissionAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
    }
}
