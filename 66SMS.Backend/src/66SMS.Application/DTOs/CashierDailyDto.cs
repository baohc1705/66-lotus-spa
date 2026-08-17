namespace _66SMS.Application.DTOs
{
    public class StaffColumnDto
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Avatar { get; set; }
    }

    public class CashierCalendarBookingDto
    {
        public string Id { get; set; } = null!;
        public string? CustomerName { get; set; }
        public string? BookingDate { get; set; }
        public string? ServiceName { get; set; }
        public int StaffId { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public int Status { get; set; }
    }

    public class CashierDailyDto
    {
        public List<StaffColumnDto> Columns { get; set; } = new();
        public List<CashierCalendarBookingDto> Bookings { get; set; } = new();
    }
}
