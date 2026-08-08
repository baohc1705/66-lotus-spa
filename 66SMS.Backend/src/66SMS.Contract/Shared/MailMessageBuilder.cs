namespace _66SMS.Contract.Shared
{
    /// <summary>
    /// Fluent builder để tạo MailMessage tùy chỉnh khi không muốn dùng template có sẵn.
    /// </summary>
    public sealed class MailMessageBuilder
    {
        private string toEmail = string.Empty;
        private string subject = string.Empty;
        private string htmlBody = string.Empty;

        public MailMessageBuilder To(string email)
        {
            toEmail = email;
            return this;
        }

        public MailMessageBuilder WithSubject(string mailSubject)
        {
            subject = mailSubject;
            return this;
        }

        public MailMessageBuilder WithHtmlBody(string body)
        {
            htmlBody = body;
            return this;
        }

        public MailMessage Build()
        {
            if (string.IsNullOrWhiteSpace(toEmail))
                throw new InvalidOperationException("ToEmail is required.");

            if (string.IsNullOrWhiteSpace(subject))
                throw new InvalidOperationException("Subject is required.");

            if (string.IsNullOrWhiteSpace(htmlBody))
                throw new InvalidOperationException("HtmlBody is required.");

            return new MailMessage
            {
                ToEmail = toEmail,
                Subject = subject,
                HtmlBody = htmlBody,
            };
        }
    }
}