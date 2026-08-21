using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Messages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quartz;

namespace _66SMS.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Job hủy lịch hẹn CONFIRMED quá hạn đặt cọc (deposit_deadline_at).
    /// </summary>
    [DisallowConcurrentExecution]
    public class CancelExpiredDepositAppointmentsJob : IJob
    {
        private readonly IServiceScopeFactory scopeFactory;
        private readonly ILogger<CancelExpiredDepositAppointmentsJob> logger;

        public CancelExpiredDepositAppointmentsJob(
            IServiceScopeFactory scopeFactory,
            ILogger<CancelExpiredDepositAppointmentsJob> logger)
        {
            this.scopeFactory = scopeFactory;
            this.logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = scopeFactory.CreateScope();
            var appointmentRepository = scope.ServiceProvider.GetRequiredService<IAppointmentSqlRepository>();
            var configAppointmentRepository = scope.ServiceProvider.GetRequiredService<IConfigAppointmentSqlRepository>();
            var bookingPositionRepository = scope.ServiceProvider.GetRequiredService<IBookingPositionSqlRepository>();
            var staffRepository = scope.ServiceProvider.GetRequiredService<IStaffSqlRepository>();
            var domainEventPublisher = scope.ServiceProvider.GetRequiredService<IDomainEventPublisher>();
            var sqlUnitOfWork = scope.ServiceProvider.GetRequiredService<ISqlUnitOfWork>();

            var now = DateTimeHelper.UtcNow();

            var expiredAppointments = await appointmentRepository.AsQueryable()
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Customer)
                .Where(a => a.Status == AppointmentConst.STATUS_CONFIRMED)
                .Where(a => a.DepositDeadlineAt != null && a.DepositDeadlineAt <= now)
                .ToListAsync(context.CancellationToken);

            if (expiredAppointments.Count == 0)
            {
                logger.LogDebug("Không có lịch hẹn quá hạn cọc cần hủy.");
                return;
            }

            var depositPercentBySalon = await AppointmentPaymentCalculator.LoadDepositPercentBySalonAsync(
                configAppointmentRepository,
                expiredAppointments.Select(a => a.SalonId),
                context.CancellationToken);

            var cancelledCount = 0;

            for (var index = 0; index < expiredAppointments.Count; index++)
            {
                var appointment = expiredAppointments[index];

                if (AppointmentPaymentCalculator.HasDepositPaid(appointment, depositPercentBySalon))
                    continue;

                using var transaction = await sqlUnitOfWork.BeginTransactionAsync(context.CancellationToken);

                try
                {
                    appointment.Status = AppointmentConst.STATUS_CANCELLED;
                    appointment.UpdatedAt = now;

                    await BookingPositionReleaseService.ReleasePositionIfNeededAsync(
                        appointment,
                        bookingPositionRepository,
                        context.CancellationToken);

                    appointmentRepository.Update(appointment);
                    await sqlUnitOfWork.SaveChangeAsync(context.CancellationToken);
                    transaction.Commit();

                    await PublishCancelledNotificationAsync(
                        appointment,
                        staffRepository,
                        domainEventPublisher,
                        context.CancellationToken);

                    cancelledCount++;
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    logger.LogError(
                        ex,
                        "Không hủy được lịch hẹn #{AppointmentId} quá hạn cọc.",
                        appointment.Id);
                }
            }

            if (cancelledCount > 0)
                logger.LogInformation("Đã hủy {Count} lịch hẹn quá hạn đặt cọc.", cancelledCount);
        }

        private static async Task PublishCancelledNotificationAsync(
            Appointment appointment,
            IStaffSqlRepository staffRepository,
            IDomainEventPublisher domainEventPublisher,
            CancellationToken cancellationToken)
        {
            var staffUserId = await staffRepository.AsQueryable(asNoTracking: true)
                .Where(s => s.Id == appointment.StaffId)
                .Select(s => (int?)s.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            var customerName = appointment.CreatedByUser?.Customer?.FullName
                ?? appointment.CreatedByUser?.Username;

            var at = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");
            var staffMessage = $"Lịch hẹn #{appointment.Id} của khách {customerName} đã tự động hủy do quá hạn đặt cọc vào lúc {at}.";
            var customerMessage = $"Lịch hẹn #{appointment.Id} của bạn đã bị hủy do quá hạn đặt cọc vào lúc {at}.";

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_APPOINTMENT_STATUS_CHANGED,
                Title = "Lịch hẹn đã hủy",
                Message = staffMessage,
                Payload = new BookingNotificationPayload
                {
                    CustomerMessage = customerMessage,
                    SalonId = appointment.SalonId,
                    CustomerUserId = appointment.CreatedByUserId,
                    StaffUserId = staffUserId,
                    AppointmentId = appointment.Id,
                    StaffId = appointment.StaffId,
                    Status = appointment.Status,
                    CustomerName = customerName,
                    AppointmentDate = appointment.AppointmentDate,
                },
            }, cancellationToken);
        }
    }
}
