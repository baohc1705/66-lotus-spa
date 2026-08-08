namespace _66SMS.Contract.Messages
{
    public class SendEmailEvent : DomainEvent
    {
        public string ToEmail { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string HtmlBody { get; set; } = null!;
    }
}
