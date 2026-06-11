using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class BookingRoom : EntityBase<int>
    {
        public string Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<BookingPosition>? Positions { get; set; }
    }
}
