using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class WorkSchedule : EntityBase<int>
    {
        public int? ShiftId { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public int? SalonId { get; set; }
        public int StaffId { get; set; }
        public DateOnly WorkDate { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public Shift? Shift { get; set; }
        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
    }
}
