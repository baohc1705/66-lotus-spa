namespace _66SMS.Application.DTOs
{
    public class CashierPositionDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string Name { get; set; } = null!;
        public string RoomName { get; set; } = null!;
        public int Status { get; set; }
        public string StatusLabel { get; set; } = null!;
        public bool IsSelectable { get; set; }
    }
}
