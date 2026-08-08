using System.Text.Json;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Messages;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Realtime
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> hubContext;
        private readonly INotificationSqlRepository notificationSqlRepository;
        private readonly IStaffSalonSqlRepository staffSalonSqlRepository;
        private readonly IStaffSqlRepository staffSqlRepository;
        private readonly ILogger<NotificationService> logger;

        public NotificationService(
            IHubContext<NotificationHub> hubContext,
            INotificationSqlRepository notificationSqlRepository,
            IStaffSalonSqlRepository staffSalonSqlRepository,
            IStaffSqlRepository staffSqlRepository,
            ILogger<NotificationService> logger)
        {
            this.hubContext = hubContext;
            this.notificationSqlRepository = notificationSqlRepository;
            this.staffSalonSqlRepository = staffSalonSqlRepository;
            this.staffSqlRepository = staffSqlRepository;
            this.logger = logger;
        }

        public async Task NofifyAsync<TPayload>(SendNotificationEvent<TPayload> notificationEvent, CancellationToken cancellationToken = default) where TPayload : class
        {
            try
            {
                var userIds = await ResolveRecipientUserIdsAsync(notificationEvent, cancellationToken);
                var payloadJson = notificationEvent.Payload == null
                    ? null
                    : JsonSerializer.Serialize(notificationEvent.Payload);

                var customerUserId = notificationEvent.CustomerUserId;
                var customerMessage = string.IsNullOrWhiteSpace(notificationEvent.CustomerMessage)
                    ? notificationEvent.Message
                    : notificationEvent.CustomerMessage;
                var staffMessage = notificationEvent.Message;

                var customerIds = customerUserId is int cid && userIds.Contains(cid)
                    ? new List<int> { cid }
                    : new List<int>();
                var staffIds = userIds.Where(id => id != customerUserId).ToList();

                if (staffIds.Count > 0)
                {
                    await notificationSqlRepository.SaveForUsersAsync(
                        staffIds,
                        notificationEvent.Domain,
                        notificationEvent.EventType,
                        notificationEvent.Title,
                        staffMessage,
                        notificationEvent.SalonId,
                        payloadJson,
                        cancellationToken);
                }

                if (customerIds.Count > 0)
                {
                    await notificationSqlRepository.SaveForUsersAsync(
                        customerIds,
                        notificationEvent.Domain,
                        notificationEvent.EventType,
                        notificationEvent.Title,
                        customerMessage,
                        notificationEvent.SalonId,
                        payloadJson,
                        cancellationToken);
                }

                object Body(string message) => new
                {
                    domain = notificationEvent.Domain,
                    eventType = notificationEvent.EventType,
                    title = notificationEvent.Title,
                    message,
                    salonId = notificationEvent.SalonId,
                    customerUserId = notificationEvent.CustomerUserId,
                    staffUserId = notificationEvent.StaffUserId,
                    payload = notificationEvent.Payload,
                };

                if (notificationEvent.SalonId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_SALON_PREFIX + notificationEvent.SalonId)
                        .SendAsync("ReceiveNotification", Body(staffMessage), cancellationToken);

                if (notificationEvent.CustomerUserId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + notificationEvent.CustomerUserId)
                        .SendAsync("ReceiveNotification", Body(customerMessage), cancellationToken);

                if (notificationEvent.StaffUserId != null && notificationEvent.StaffUserId != notificationEvent.CustomerUserId)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + notificationEvent.StaffUserId)
                        .SendAsync("ReceiveNotification", Body(staffMessage), cancellationToken);

                logger.LogInformation("Sent notification {Domain}/{EventType} salon={SalonId} recipients={Count}",
                    notificationEvent.Domain, notificationEvent.EventType, notificationEvent.SalonId, userIds.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send notification {EventType}", notificationEvent.EventType);
            }
        }

        private async Task<List<int>> ResolveRecipientUserIdsAsync<TPayload>(
            SendNotificationEvent<TPayload> notificationEvent,
            CancellationToken cancellationToken) where TPayload : class
        {
            var userIds = new HashSet<int>();

            if (notificationEvent.CustomerUserId is int customerUserId)
                userIds.Add(customerUserId);

            if (notificationEvent.StaffUserId is int staffUserId)
                userIds.Add(staffUserId);

            if (notificationEvent.SalonId is int salonId)
            {
                var staffIds = await staffSalonSqlRepository.AsQueryable()
                    .Where(x => x.SalonId == salonId && x.Status == StaffSalonConst.STATUS_ACTIVE)
                    .Select(x => x.StaffId)
                    .ToListAsync(cancellationToken);

                if (staffIds.Count > 0)
                {
                    var salonUserIds = await staffSqlRepository.AsQueryable()
                        .Where(x => staffIds.Contains(x.Id))
                        .Select(x => x.UserId)
                        .ToListAsync(cancellationToken);

                    foreach (var id in salonUserIds)
                        userIds.Add(id);
                }
            }

            return userIds.ToList();
        }
    }
}
