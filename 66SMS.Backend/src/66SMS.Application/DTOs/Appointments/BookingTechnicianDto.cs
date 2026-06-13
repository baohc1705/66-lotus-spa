namespace _66SMS.Application.DTOs.Appointments
{
    public class BookingTechnicianDto
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? AccountRole { get; set; }
        public string? Avatar { get; set; }
        public int? SlotsLeft { get; set; }
        public string? Status { get; set; }
        public bool? IsAny { get; set; }
    }
}
