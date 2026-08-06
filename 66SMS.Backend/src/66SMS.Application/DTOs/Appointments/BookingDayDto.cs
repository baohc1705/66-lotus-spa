namespace _66SMS.Application.DTOs.Appointments
{
    public class BookingDayDto
    {
        public DateOnly Date { get; set; }
        public string DayName { get; set; } = string.Empty;
        public int DayNum { get; set; }
        public bool IsToday { get; set; }
        public bool IsBookedOut { get; set; }
    }
}
