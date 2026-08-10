namespace _66SMS.Domain.Messages
{
    public class BookingNotificationPayload
    {
        public string? CustomerMessage { get; set; }
        public int? SalonId { get; set; }
        public int? CustomerUserId { get; set; }
        public int? StaffUserId { get; set; }

        public int AppointmentId { get; set; }
        public int? StaffId { get; set; }
        public int Status { get; set; }
        public string? CustomerName { get; set; }
        public DateOnly? AppointmentDate { get; set; }
    }
}
