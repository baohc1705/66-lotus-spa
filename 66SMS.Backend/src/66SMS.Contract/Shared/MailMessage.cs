namespace _66SMS.Contracts.Shared
{
    public class MailMessage
    {
        public string ToEmail { get; init; } = string.Empty;
        public string Subject { get; init; } = string.Empty;
        public string HtmlBody { get; init; } = string.Empty;
    }
}
