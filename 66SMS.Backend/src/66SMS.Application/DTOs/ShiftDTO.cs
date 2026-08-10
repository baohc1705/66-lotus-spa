namespace _66SMS.Application.DTOs
{
    public class ShiftDTO
    {
        public int? Id { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
    }
}
