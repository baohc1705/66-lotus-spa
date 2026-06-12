using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class WorkSchedule : EntityBase<int>
    {
        public int ShiftPeriodId { get; set; }
        public int StaffId { get; set; }
        public DateOnly WorkDate { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public ShiftPeriod? ShiftPeriod { get; set; }
        public Staff? Staff { get; set; }
    }
}
