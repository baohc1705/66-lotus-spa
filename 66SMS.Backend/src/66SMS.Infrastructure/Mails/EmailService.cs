using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Contracts.Shared;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace _66SMS.Infrastructure.Mails
{
    public class EmailService : IEmailService
    {
        private readonly MailSettings mailSettings;

        public EmailService(IOptions<MailSettings> options)
        {
            mailSettings = options.Value;
        }
        public async Task SendAsync(MailMessage message, CancellationToken cancellationToken = default)
        {
            // Tao mime message tu message
            MimeMessage mimeMessage = BuildMimeMessage(message);

            // Tao smtp client
            using SmtpClient smtpClient = new();
            try
            {
                // Connection 
                await smtpClient.ConnectAsync(mailSettings.Host, mailSettings.Port, SecureSocketOptions.StartTls, cancellationToken);
                await smtpClient.AuthenticateAsync(mailSettings.User, mailSettings.Password,cancellationToken);
                await smtpClient.SendAsync(mimeMessage, cancellationToken);
                await smtpClient.DisconnectAsync(true, cancellationToken);
            }
            catch
            {
                throw;
            }
        }

        private MimeMessage BuildMimeMessage(MailMessage message)
        {
            MimeMessage mimeMessage = new();
            mimeMessage.From.Add(new MailboxAddress(mailSettings.FromName, mailSettings.FromEmail));
            mimeMessage.To.Add(new MailboxAddress(message.ToEmail, message.ToEmail));
            mimeMessage.Subject = message.Subject;
            mimeMessage.Body = new BodyBuilder { HtmlBody = message.HtmlBody }.ToMessageBody();
            return mimeMessage;
        }
    }
}
