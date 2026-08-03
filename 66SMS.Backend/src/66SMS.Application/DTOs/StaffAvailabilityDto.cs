namespace _66SMS.Application.DTOs
{
    public class StaffAvailabilityDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public string? Avatar { get; set; }
        public int? ScheduleId { get; set; }
        public string Status { get; set; } = null!; // available | busy | off
        public string? Reason { get; set; }
        public string? BusyCustomerName { get; set; }
        public string? BusyTimeRange { get; set; }
    }
}
