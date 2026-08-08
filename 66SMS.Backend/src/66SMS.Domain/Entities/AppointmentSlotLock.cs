using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class AppointmentSlotLock : EntityBase<int>
    {
        public int? AppointmentId { get; set; }
        public int SlotId { get; set; }
        public int StaffId { get; set; }
        public int? PositionId { get; set; }
        public int LockedByUserId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int SlotsNeeded { get; set; } = 1;
        public DateTimeOffset LockedAt { get; set; }
        public DateTimeOffset ExpiresAt { get; set; }
        public DateTimeOffset? ReleasedAt { get; set; }
        public int Status { get; set; }

        // Navigation properties
        public Appointment? Appointment { get; set; }
        public TimeSlot? TimeSlot { get; set; }
        public Staff? Staff { get; set; }
        public BookingPosition? Position { get; set; }
        public User? LockedByUser { get; set; }
    }
}
