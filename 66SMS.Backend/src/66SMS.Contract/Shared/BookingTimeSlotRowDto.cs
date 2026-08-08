namespace _66SMS.Contract.Shared
{
    public class BookingTimeSlotRowDto
    {
        public int SlotId { get; set; }
        public string Time { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}
