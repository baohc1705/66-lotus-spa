using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentService : EntityBase<int>
    {
        public int AppointmentId { get; set; }
        public int ServiceId { get; set; }
        public decimal PriceSnapshot { get; set; }
        public int DurationSnapshot { get; set; }
        public int Quantity { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public Service? Service { get; set; }
    }
}
