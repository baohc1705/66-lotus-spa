using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class BookingRoom : EntityBase<int>
    {
        public int? SalonId { get; set; }
        public string Name { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public List<BookingPosition>? Positions { get; set; }
        public Salon? Salon { get; set; }
    }
}
