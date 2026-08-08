using System.Text.Json;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Messages;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Messages;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace _66SMS.Infrastructure.Realtime
{
    public class NotificationService : INotificationService
    {
        private static readonly JsonSerializerOptions PayloadJsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        };

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
                var booking = notificationEvent.Payload as BookingNotificationPayload;
                var userIds = await ResolveRecipientUserIdsAsync(booking, cancellationToken);
                var payloadJson = notificationEvent.Payload == null
                    ? null
                    : JsonSerializer.Serialize(notificationEvent.Payload, PayloadJsonOptions);

                var customerUserId = booking?.CustomerUserId;
                var customerMessage = string.IsNullOrWhiteSpace(booking?.CustomerMessage)
                    ? notificationEvent.Message
                    : booking!.CustomerMessage;
                var staffMessage = notificationEvent.Message;

                var customerIds = customerUserId != null && userIds.Contains(customerUserId.Value)
                    ? new List<int> { customerUserId.Value }
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
                        booking?.SalonId,
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
                        booking?.SalonId,
                        payloadJson,
                        cancellationToken);
                }

                object Body(string message) => new
                {
                    domain = notificationEvent.Domain,
                    eventType = notificationEvent.EventType,
                    title = notificationEvent.Title,
                    message,
                    payload = notificationEvent.Payload,
                };

                if (booking?.SalonId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_SALON_PREFIX + booking.SalonId)
                        .SendAsync("ReceiveNotification", Body(staffMessage), cancellationToken);

                if (booking?.CustomerUserId != null)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + booking.CustomerUserId)
                        .SendAsync("ReceiveNotification", Body(customerMessage), cancellationToken);

                if (booking?.StaffUserId != null && booking.StaffUserId != booking.CustomerUserId)
                    await hubContext.Clients.Group(NotificationConst.GROUP_USER_PREFIX + booking.StaffUserId)
                        .SendAsync("ReceiveNotification", Body(staffMessage), cancellationToken);

                logger.LogInformation("Sent notification {Domain}/{EventType} salon={SalonId} recipients={Count}",
                    notificationEvent.Domain, notificationEvent.EventType, booking?.SalonId, userIds.Count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send notification {EventType}", notificationEvent.EventType);
            }
        }

        private async Task<List<int>> ResolveRecipientUserIdsAsync(
            BookingNotificationPayload? booking,
            CancellationToken cancellationToken)
        {
            var userIds = new HashSet<int>();
            if (booking == null)
                return userIds.ToList();

            if (booking.CustomerUserId != null)
                userIds.Add(booking.CustomerUserId.Value);

            if (booking.StaffUserId != null)
                userIds.Add(booking.StaffUserId.Value);

            if (booking.SalonId != null)
            {
                var staffIds = await staffSalonSqlRepository.AsQueryable()
                    .Where(x => x.SalonId == booking.SalonId && x.Status == StaffSalonConst.STATUS_ACTIVE)
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
