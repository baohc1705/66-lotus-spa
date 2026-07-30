namespace _66SMS.Contracts.Messages
{
    /// <summary>
    /// Event gửi email generic (OTP, reset password, welcome, …).
    /// Consumer: SendEmailConsumer.
    /// </summary>
    public class SendEmailEvent : DomainEvent
    {
        public string ToEmail { get; set; } = null!;
        public string Subject { get; set; } = null!;
        public string HtmlBody { get; set; } = null!;
    }
}
