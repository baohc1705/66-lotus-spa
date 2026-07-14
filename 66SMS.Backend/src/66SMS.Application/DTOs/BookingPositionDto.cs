namespace _66SMS.Application.DTOs
{
    public class BookingPositionDto
    {
        public int? Id { get; set; }
        public int? RoomId { get; set; }
        public string? Name { get; set; }
        public int? SortOrder { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public string? RoomName { get; set; }
    }
}
