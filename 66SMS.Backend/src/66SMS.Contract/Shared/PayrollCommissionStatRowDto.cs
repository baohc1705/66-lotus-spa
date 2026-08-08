namespace _66SMS.Contract.Shared
{
    /// <summary>
    /// Flat row từ usp_GetPayrollCommissionStats (map cột SQL → property).
    /// </summary>
    public class PayrollCommissionStatRowDto
    {
        public int StaffId { get; set; }
        public string? StaffName { get; set; }
        public decimal? BasicSalary { get; set; }
        public int? SalaryType { get; set; }

        public int? InvoiceId { get; set; }
        public string? InvoiceCode { get; set; }
        public int? InvoiceCustomerId { get; set; }
        public string? InvoiceCustomerName { get; set; }
        public string? InvoiceCustomerPhone { get; set; }
        public int? InvoiceAppointmentId { get; set; }
        public int? InvoiceSalonId { get; set; }
        public int? InvoiceCashierId { get; set; }
        public decimal? InvoiceSubTotal { get; set; }
        public decimal? InvoiceDiscountAmount { get; set; }
        public decimal? InvoiceTotalAmount { get; set; }
        public decimal? InvoicePaidAmount { get; set; }
        public int? InvoicePaymentMethod { get; set; }
        public int? InvoiceStatus { get; set; }
        public string? InvoiceNote { get; set; }
        public DateTimeOffset? InvoiceIssuedAt { get; set; }
        public DateOnly? IssuedLocalDate { get; set; }

        public int? InvoiceItemId { get; set; }
        public int? ItemType { get; set; }
        public int? ItemRefId { get; set; }
        public string? ItemName { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? Quantity { get; set; }
        public decimal? ItemDiscountAmount { get; set; }
        public decimal? LineTotal { get; set; }
        public int? ItemStaffId { get; set; }
        public string? ItemNote { get; set; }
        public int? ItemStatus { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal? CommissionAmount { get; set; }

        public int? AppointmentId { get; set; }
        public string? AppointmentCode { get; set; }
        public int? AppointmentCreatedByUserId { get; set; }
        public int? AppointmentStaffId { get; set; }
        public int? SlotId { get; set; }
        public int? PositionId { get; set; }
        public int? LockId { get; set; }
        public int? AppointmentSalonId { get; set; }
        public int? ScheduleId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int? AppointmentSource { get; set; }
        public int? AppointmentStatus { get; set; }
        public string? AppointmentNote { get; set; }
        public decimal? AppointmentTotalAmount { get; set; }
        public decimal? AppointmentPaidAmount { get; set; }
        public int? DepositPercent { get; set; }
        public DateTimeOffset? CompletedAt { get; set; }

        public TimeOnly? SlotStartTime { get; set; }
        public TimeOnly? SlotEndTime { get; set; }
        public int? DurationMins { get; set; }
    }
}
