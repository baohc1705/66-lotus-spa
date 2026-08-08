using _66SMS.Contract.Constants;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Messages;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Infrastructure.Consumers
{
    public class AppointmentCreatedConsumer : IConsumer<AppointmentCreatedEvent>
    {
        private readonly IStaffSqlRepository staffSqlRepository;

        public AppointmentCreatedConsumer(IStaffSqlRepository staffSqlRepository)
        {
            this.staffSqlRepository = staffSqlRepository;
        }

        public async Task Consume(ConsumeContext<AppointmentCreatedEvent> context)
        {
            var message = context.Message;
            if (message.Items == null || message.Items.Count == 0)
                return;

            var staffIds = message.Items.Select(x => x.StaffId).Distinct().ToList();
            var staffUsers = await staffSqlRepository.AsQueryable(asNoTracking: true)
                .Where(x => staffIds.Contains(x.Id))
                .Select(x => new { x.Id, x.UserId })
                .ToDictionaryAsync(x => x.Id, x => x.UserId, context.CancellationToken);

            var bookedAt = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");
            var customerName = message.CustomerName;

            foreach (var item in message.Items)
            {
                staffUsers.TryGetValue(item.StaffId, out var staffUserId);
                await context.Publish(new SendNotificationEvent<BookingNotificationPayload>
                {
                    Domain = NotificationConst.DOMAIN_BOOKING,
                    EventType = NotificationConst.EVENT_APPOINTMENT_CREATED,
                    Title = "Lịch hẹn mới",
                    Message = $"Khách hàng {customerName} vừa đặt lịch hẹn #{item.AppointmentId} vào lúc {bookedAt}",
                    SalonId = item.SalonId,
                    StaffUserId = staffUserId,
                    Payload = new BookingNotificationPayload
                    {
                        AppointmentId = item.AppointmentId,
                        StaffId = item.StaffId,
                        Status = item.Status,
                        CustomerName = customerName,
                        AppointmentDate = item.AppointmentDate,
                    },
                }, context.CancellationToken);
            }
        }
    }
}
