namespace _66SMS.Application.DTOs
{
    public class StaffSalonDto
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
        public string? StaffCode { get; set; }
        public string? StaffRole { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public bool? IsManager { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }    
        public int? Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
