using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class TimeSlot : EntityBase<int>
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public ICollection<Appointment>? Appointments { get; set; }
        public ICollection<AppointmentSlotLock>? SlotLocks { get; set; }
    }
}
