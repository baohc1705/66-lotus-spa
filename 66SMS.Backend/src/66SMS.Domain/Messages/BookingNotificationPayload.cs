namespace _66SMS.Domain.Messages
{
    public class BookingNotificationPayload
    {
        public int AppointmentId { get; set; }
        public int? StaffId { get; set; }
        public int Status { get; set; }
        public string? CustomerName { get; set; }
        public DateOnly? AppointmentDate { get; set; }
    }
}
