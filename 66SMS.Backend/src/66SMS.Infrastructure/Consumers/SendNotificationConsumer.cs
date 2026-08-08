using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Messages;
using MassTransit;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Consumers
{
    public class SendNotificationConsumer<TPayload> : IConsumer<SendNotificationEvent<TPayload>> where TPayload : class
    {
        private readonly INotificationService notificationService;
        private readonly ILogger<SendNotificationConsumer<TPayload>> logger;
        public SendNotificationConsumer(INotificationService notificationService, ILogger<SendNotificationConsumer<TPayload>> logger)
        {
            this.notificationService = notificationService;
            this.logger = logger;
        }

        public async Task Consume(ConsumeContext<SendNotificationEvent<TPayload>> context)
        {
            var msg = context.Message;
            logger.LogInformation("Notification {Domain}/{EventType}", msg.Domain, msg.EventType);
            await notificationService.NofifyAsync(msg, context.CancellationToken);
        }
    }
}
