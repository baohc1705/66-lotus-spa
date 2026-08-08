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
        public decimal Rate { get; set; } = 0;
        public decimal TotalHours { get; set; } = 0;
        public decimal TotalWorkDays { get; set; } = 0;
        public decimal BaseAmount { get; set; } = 0;
        public decimal CommissionAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; } = 0;
        public int Status { get; set; }
        public string? Note { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
    }
}
