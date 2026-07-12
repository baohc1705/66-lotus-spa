using _66SMS.Contract.Messages;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Consumers
{
    /// <summary>
    /// Consumer gửi email generic qua SMTP.
    /// </summary>
    public class SendEmailConsumer : IConsumer<SendEmailEvent>
    {
        private readonly IEmailService emailService;
        private readonly ILogger<SendEmailConsumer> logger;

        public SendEmailConsumer(IEmailService emailService, ILogger<SendEmailConsumer> logger)
        {
            this.emailService = emailService;
            this.logger = logger;
        }

        public async Task Consume(ConsumeContext<SendEmailEvent> context)
        {
            var msg = context.Message;
            logger.LogInformation("Sending email to {ToEmail}, subject: {Subject}", msg.ToEmail, msg.Subject);

            await emailService.SendAsync(new MailMessage
            {
                ToEmail = msg.ToEmail,
                Subject = msg.Subject,
                HtmlBody = msg.HtmlBody,
            }, context.CancellationToken);
        }
    }
}
