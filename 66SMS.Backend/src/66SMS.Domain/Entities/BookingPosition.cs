using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class BookingPosition : EntityBase<int>
    {
        public int RoomId { get; set; }
        public string Name { get; set; } = null!;
        public int? SortOrder { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public BookingRoom? Room { get; set; }
    }
}
