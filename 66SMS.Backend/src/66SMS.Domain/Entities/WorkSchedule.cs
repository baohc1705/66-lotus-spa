using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class WorkSchedule : EntityAuditTable<int>
    {
        public int ShiftPeriodId { get; set; }
        public int EmployeeId { get; set; }
        public DateOnly WorkDate { get; set; }

        public ShiftPeriod? ShiftPeriod { get; set; }
        public Employee? Employee { get; set; }
    }
}
