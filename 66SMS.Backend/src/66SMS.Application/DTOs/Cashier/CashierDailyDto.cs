using System.Collections.Generic;

namespace _66SMS.Application.DTOs.Cashier
{
    public class StaffColumnDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Avatar { get; set; }
    }

    public class CashierBookingDto
    {
        public string Id { get; set; }
        public string CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAvatar { get; set; }
        public string? BookingDate { get; set; }
        public string ServiceName { get; set; }
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DepositAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool DepositPaid { get; set; }
        public DateTime? DepositDeadlineAt { get; set; }
        public string? Note { get; set; }
        public decimal CustomerWalletBalance { get; set; }
    }

    public class CashierDailyDto
    {
        public List<StaffColumnDto> Columns { get; set; } = new();
        public List<CashierBookingDto> Bookings { get; set; } = new();
    }
}
