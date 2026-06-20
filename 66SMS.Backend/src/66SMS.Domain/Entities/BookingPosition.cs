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
        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public BookingRoom? Room { get; set; }
    }
}
