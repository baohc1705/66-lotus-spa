namespace _66SMS.Application.DTOs.StaffSalons
{
    public class StaffSalonDto
    {
        public int? Id { get; set; }
        public int? StaffId { get; set; }
        public int? SalonId { get; set; }
        public bool? IsManager { get; set; }
        public string? StartDate { get; set; }
        public string? EndDate { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
    }
}
