using _66SMS.Application.DTOs.Shifts;

namespace _66SMS.Application.DTOs.WorkSchedules
{
    public class WorkScheduleDTO
    {
        public int? Id { get; set; }
        public int? ShiftPeriodId { get; set; }
        public int? StaffId { get; set; }
        public DateOnly? WorkDate { get; set; }
        public ShiftDTO? Shift { get; set; }
        public string? StaffName { get; set; }
    }
}
