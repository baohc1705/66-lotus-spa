namespace _66SMS.Contract.Messages
{
    public class AppointmentCreatedEvent : DomainEvent
    {
        public string? CustomerName { get; set; }
        public List<AppointmentCreatedItem> Items { get; set; } = new();
    }

    public class AppointmentCreatedItem
    {
        public int AppointmentId { get; set; }
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int Status { get; set; }
        public DateOnly AppointmentDate { get; set; }
    }
}
