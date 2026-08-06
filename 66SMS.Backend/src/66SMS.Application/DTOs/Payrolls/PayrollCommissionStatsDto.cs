namespace _66SMS.Application.DTOs.Payrolls
{
    public class PayrollCommissionStatsDto
    {
        public int StaffId { get; set; }
        public string? StaffName { get; set; }
        public decimal? BasicSalary { get; set; }
        public int? SalaryType { get; set; }
        public string? FromDate { get; set; }
        public string? ToDate { get; set; }
        public PayrollCommissionSummaryDto Summary { get; set; } = new();
        public List<PayrollCommissionAppointmentDto> Appointments { get; set; } = new();
    }

    public class PayrollCommissionSummaryDto
    {
        public int TotalAppointments { get; set; }
        public int TotalServices { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal? BasicSalary { get; set; }
        public decimal EstimatedTotal { get; set; }
    }

    public class PayrollCommissionDailyStatsDto
    {
        public int StaffId { get; set; }
        public string? StaffName { get; set; }
        public decimal? BasicSalary { get; set; }
        public int? SalaryType { get; set; }
        public string? FromDate { get; set; }
        public string? ToDate { get; set; }
        public PayrollCommissionDailySummaryDto Summary { get; set; } = new();
        public List<PayrollCommissionDailyDto> Items { get; set; } = new();
    }

    public class PayrollCommissionDailySummaryDto
    {
        public int TotalOrders { get; set; }
        public decimal TotalServiceHours { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal? BasicSalary { get; set; }
        public decimal EstimatedTotal { get; set; }
    }

    public class PayrollCommissionDailyDto
    {
        public DateOnly WorkDate { get; set; }
        public int OrderCount { get; set; }
        public decimal ServiceHours { get; set; }
        public decimal TotalCommission { get; set; }
    }

    public class PayrollCommissionAppointmentDto
    {
        public int? AppointmentId { get; set; }
        public string? AppointmentCode { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public DateOnly? IssuedLocalDate { get; set; }
        public int? AppointmentStatus { get; set; }
        public string? AppointmentNote { get; set; }
        public decimal? AppointmentTotalAmount { get; set; }
        public decimal? AppointmentPaidAmount { get; set; }
        public int? DepositPercent { get; set; }
        public DateTimeOffset? CompletedAt { get; set; }
        public int? SlotId { get; set; }
        public TimeOnly? SlotStartTime { get; set; }
        public TimeOnly? SlotEndTime { get; set; }
        public int? DurationMins { get; set; }
        public int? PositionId { get; set; }
        public int? SalonId { get; set; }

        public int? InvoiceId { get; set; }
        public string? InvoiceCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public decimal? InvoiceTotalAmount { get; set; }
        public decimal? InvoicePaidAmount { get; set; }
        public int? InvoicePaymentMethod { get; set; }
        public int? InvoiceStatus { get; set; }
        public DateTimeOffset? InvoiceIssuedAt { get; set; }

        public string? ServiceName { get; set; }
        public decimal TotalCommission { get; set; }
        public List<PayrollCommissionLineDto> Lines { get; set; } = new();
    }

    public class PayrollCommissionLineDto
    {
        public int? InvoiceItemId { get; set; }
        public int? ItemType { get; set; }
        public int? ItemRefId { get; set; }
        public string? ItemName { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? Quantity { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? LineTotal { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal CommissionAmount { get; set; }
        public string? Note { get; set; }
    }
}
