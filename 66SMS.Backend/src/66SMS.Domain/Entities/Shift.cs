using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Shift : EntityBase<int>
    {
        public int? SalonId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }

        public Salon? Salon { get; set; }
        public List<WorkSchedule>? WorkSchedules { get; set; }
    }
}
