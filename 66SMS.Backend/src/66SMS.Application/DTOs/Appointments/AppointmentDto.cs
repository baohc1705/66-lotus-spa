namespace _66SMS.Application.DTOs.Appointments
{
    public class AppointmentDto
    {
        public int? Id { get; set; }
        public string? AppointmentCode { get; set; }
        public int? CustomerId { get; set; }
        public int? StaffId { get; set; }
        public int? SlotId { get; set; }
        public int? PositionId { get; set; }
        public DateOnly? AppointmentDate { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public DateTime? CreatedAt { get; set; }

        public string? StaffFullName { get; set; }
        public TimeOnly? TimeSlotStartTime { get; set; }
        public TimeOnly? TimeSlotEndTime { get; set; }
        public string? PositionName { get; set; }
        public string? PositionRoomName { get; set; }
        public List<string>? ServiceNames { get; set; }
    }
}
