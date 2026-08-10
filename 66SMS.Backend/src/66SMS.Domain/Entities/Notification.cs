using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Notification : EntityBase<int>
    {
        public int UserId { get; set; }
        public int? SalonId { get; set; }
        public string Domain { get; set; } = null!;
        public string EventType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string? PayloadJson { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTimeOffset CreatedAt { get; set; }
    }
}
