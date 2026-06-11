using _66SMS.Application.DTOs.Shifts;

namespace _66SMS.Application.DTOs.WorkSchedules
{
    public class WorkScheduleDTO
    {
        public int? Id { get; set; }
        public int? ShiftPeriodId { get; set; }
        public int? EmployeeId { get; set; }
        public DateOnly? WorkDate { get; set; }
        public ShiftDTO? Shift { get; set; }
        public string? EmployeeName { get; set; }
    }
}
