namespace _66SMS.Domain.Models
{
    public class BookingTechnicianRowDto
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; } = null!;
        public string? Avatar { get; set; }
        public int SlotsLeft { get; set; }
    }
}
