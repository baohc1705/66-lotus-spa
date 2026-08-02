namespace _66SMS.Application.DTOs
{
    public class BookingRoomDto
    {
        public int? Id { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public int AvailableCount { get; set; }
        public int InServiceCount { get; set; }
        public int TotalPositionCount { get; set; }

        public List<BookingPositionDto>? Positions { get; set; }
    }
}
