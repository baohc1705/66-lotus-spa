namespace _66SMS.Domain.Models
{
    public class CashierDailyBookingRowDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = null!;
        public string? BookingDate { get; set; }
        public string ServiceName { get; set; } = null!;
        public int StaffId { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public int Status { get; set; }
    }
}
