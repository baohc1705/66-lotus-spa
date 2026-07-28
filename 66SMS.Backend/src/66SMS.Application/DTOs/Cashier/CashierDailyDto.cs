using System.Collections.Generic;

namespace _66SMS.Application.DTOs.Cashier
{
    public class StaffColumnDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Avatar { get; set; }
    }

    public class CashierBookingDto
    {
        public string Id { get; set; } = null!;
        public string? AppointmentCode { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? CustomerPhone { get; set; }
        public string? CustomerAvatar { get; set; }
        public string? BookingDate { get; set; }
        public string ServiceName { get; set; } = null!;
        public int StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public string StartTime { get; set; } = null!;
        public string EndTime { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool DepositPaid { get; set; }
        public DateTimeOffset? DepositDeadlineAt { get; set; }
        public string? Note { get; set; }
        public decimal CustomerWalletBalance { get; set; }
        public int? InvoiceId { get; set; }
        public string? InvoiceCode { get; set; }
        public decimal DiscountAmount { get; set; }
        public int? PositionId { get; set; }
        public string? PositionName { get; set; }
        public int? PositionStatus { get; set; }
    }

    public class CashierDailyDto
    {
        public List<StaffColumnDto> Columns { get; set; } = new();
        public List<CashierBookingDto> Bookings { get; set; } = new();
    }
}
