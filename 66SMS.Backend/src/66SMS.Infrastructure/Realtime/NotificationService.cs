using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Messages;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Realtime
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly ILogger<NotificationService> logger;

        public NotificationService(IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger)
        {
            this.hubContext = hubContext;
            this.logger = logger;
        }

        public async Task NofifyAsync<TPayload>(SendNotificationEvent<TPayload> notificationEvent, CancellationToken cancellationToken = default) where TPayload : class
        {
            try
            {
                var body = new
                {
                    domain = notificationEvent.Domain,
                    eventType = notificationEvent.EventType,
                    title = notificationEvent.Title,
                    message = notificationEvent.Message,
                    salonId = notificationEvent.SalonId,
                    customerUserId = notificationEvent.CustomerUserId,
                    staffUserId = notificationEvent.StaffUserId,
                    payload = notificationEvent.Payload,
                };

                if (notificationEvent.SalonId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_SALON_PREFIX + notificationEvent.SalonId)
                        .SendAsync("ReceiveNotification", body, cancellationToken);

                if (notificationEvent.CustomerUserId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + notificationEvent.CustomerUserId)
                        .SendAsync("ReceiveNotification", body, cancellationToken);

                if (notificationEvent.StaffUserId != null && notificationEvent.StaffUserId != notificationEvent.CustomerUserId)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + notificationEvent.StaffUserId)
                        .SendAsync("ReceiveNotification", body, cancellationToken);

                logger.LogInformation("Sent notification {Domain}/{EventType} salon={SalonId} customer={CustomerUserId} staff={StaffUserId}",
                    notificationEvent.Domain, notificationEvent.EventType, notificationEvent.SalonId, notificationEvent.CustomerUserId, notificationEvent.StaffUserId);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send notification {EventType}", notificationEvent.EventType);
            }
        }
    }
}
