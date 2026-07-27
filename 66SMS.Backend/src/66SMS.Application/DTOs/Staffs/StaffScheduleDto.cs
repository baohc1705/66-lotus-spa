namespace _66SMS.Application.DTOs.Staffs
{
    public class StaffScheduleBookingDto
    {
        public string Id { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string? CustomerPhone { get; set; }
        public string ServiceName { get; set; } = null!;
        public string StartTime { get; set; } = null!;
        public string EndTime { get; set; } = null!;
        /// <summary>Trạng thái lịch hẹn (int — khớp AppointmentConst).</summary>
        public int Status { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Note { get; set; }
    }

    public class StaffScheduleDailyDto
    {
        public string Date { get; set; } = null!;
        public string? StaffName { get; set; }
        public List<StaffScheduleBookingDto> Bookings { get; set; } = new();
    }

    public class StaffScheduleDayDto
    {
        public string Date { get; set; } = null!;
        public List<StaffScheduleBookingDto> Bookings { get; set; } = new();
    }

    public class StaffScheduleWeeklyDto
    {
        public string WeekStart { get; set; } = null!;
        public string WeekEnd { get; set; } = null!;
        public List<StaffScheduleDayDto> Days { get; set; } = new();
    }
}
