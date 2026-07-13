using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class WorkSchedule : EntityBase<int>
    {
        public int ShiftPeriodId { get; set; }
        public int? SalonId { get; set; }
        public int StaffId { get; set; }
        public DateOnly WorkDate { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public ShiftPeriod? ShiftPeriod { get; set; }
        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
    }
}
