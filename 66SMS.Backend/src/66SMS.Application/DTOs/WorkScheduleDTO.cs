namespace _66SMS.Application.DTOs
{
    public class WorkScheduleDTO
    {
        public int? Id { get; set; }
        public int? ShiftId { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public int? StaffId { get; set; }
        public DateOnly? WorkDate { get; set; }
        public ShiftDTO? Shift { get; set; }
        public string? StaffName { get; set; }
    }
}
