using _66SMS.Application.DTOs.BookingPositions;
namespace _66SMS.Application.DTOs.BookingRooms
{
    public class BookingRoomDto
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? ImageUrl { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        
        public List<BookingPositionDto>? Positions { get; set; }
    }
}
