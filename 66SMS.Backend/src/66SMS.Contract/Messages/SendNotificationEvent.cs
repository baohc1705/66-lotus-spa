namespace _66SMS.Contracts.Messages
{
    public class SendNotificationEvent<TPayload> :  DomainEvent where TPayload : class
    {
        public string Domain { get; set; } = null!;
        public string EventType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;

        public int? SalonId { get; set; }
        public int? CustomerUserId { get; set; }
        public int? StaffUserId { get; set; }

        public TPayload? Payload { get; set; }
    }
}
