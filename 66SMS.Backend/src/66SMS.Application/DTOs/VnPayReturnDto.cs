namespace _66SMS.Application.DTOs
{
    public class VnPayReturnDto
    {
        public int AppointmentId { get; set; }
        public string PaymentPhase { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
