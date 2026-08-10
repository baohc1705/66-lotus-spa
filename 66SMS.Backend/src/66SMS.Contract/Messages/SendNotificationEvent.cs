namespace _66SMS.Contract.Messages
{
    public class SendNotificationEvent<TPayload> : DomainEvent where TPayload : class
    {
        public string Domain { get; set; } = null!;
        public string EventType { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public TPayload? Payload { get; set; }
    }
}
