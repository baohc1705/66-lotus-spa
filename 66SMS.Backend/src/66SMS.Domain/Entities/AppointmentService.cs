using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentService : EntityBase<int>
    {
        public int AppointmentId { get; set; }
        public int ServiceId { get; set; }
        public decimal PriceSnapshot { get; set; } = 0;
        public int DurationSnapshot { get; set; } = 0;
        public int Quantity { get; set; } = 0;
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public Service? Service { get; set; }
    }
}
