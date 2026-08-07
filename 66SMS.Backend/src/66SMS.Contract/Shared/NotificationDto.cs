namespace _66SMS.Contracts.Shared
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Domain { get; set; } = null!;
        public string EventType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public int? SalonId { get; set; }
        public string? PayloadJson { get; set; }
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
