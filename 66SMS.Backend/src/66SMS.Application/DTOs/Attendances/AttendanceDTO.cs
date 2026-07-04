namespace _66SMS.Application.DTOs.Attendances
{
    public class AttendanceDTO
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public int? WorkScheduleId { get; set; }
        public string? WorkDate { get; set; }
        public string? CheckInAt { get; set; }
        public string? CheckOutAt { get; set; }
        public decimal? WorkedHours { get; set; }
        public decimal? WorkCredits { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public string? ShiftName { get; set; }
        public string? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
