using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentHistory : EntityBase<int>
    {
        public int AppointmentId { get; set; }
        public int OldStatus { get; set; }
        public int NewStatus { get; set; }
        public string? Note { get; set; }
        public int? ChangedBy { get; set; }
        public int? ChangedByRole { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public User? ChangedByUser { get; set; }
    }
}
