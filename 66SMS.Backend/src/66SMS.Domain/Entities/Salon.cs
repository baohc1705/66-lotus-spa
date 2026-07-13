using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Salon : EntityBase<int>
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string? Email { get; set; }
        public string? StreetAddress { get; set; }
        public string? ProvinceCode { get; set; }
        public string? WardCode { get; set; }
        public string? FullAddress { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? WorkingDays { get; set; }
        public string? TaxCode { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        // Navigation
        public List<StaffSalon>? StaffSalons { get; set; }
        public List<BookingRoom>? BookingRooms { get; set; }
    }
}
