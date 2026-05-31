using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ShiftPeriod : EntityBase<int>
    {
        public int ShiftId { get; set; }
        public TimeOnly ShiftStart { get; set; }
        public TimeOnly ShiftEnd { get; set; }
        public DateOnly EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Shift? Shift { get; set; }
        public List<WorkSchedule>? WorkSchedules { get; set; }
    }
}
