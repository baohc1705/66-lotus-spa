using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Messages;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus
{
    public sealed class UpdateAppointmentStatusHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IStaffSqlRepository staffSqlRepository,
        IUserSqlRepository userSqlRepository,
        IWalletSqlRepository walletSqlRepository,
        IWalletTransactionSqlRepository walletTransactionSqlRepository,
        IBookingPositionSqlRepository bookingPositionSqlRepository,
        IDomainEventPublisher domainEventPublisher,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<UpdateAppointmentStatusCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            UpdateAppointmentStatusCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.Payments)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Customer)
                .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (appointment.Status == request.Status && request.Status != AppointmentConst.STATUS_WAITING)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_THIS_STATUS, ErrorCodes.ERR_APPOINTMENT_ALREADY_THIS_STATUS);
            }

            if (request.Status == AppointmentConst.STATUS_CONFIRMED
                && appointment.Status == AppointmentConst.STATUS_PENDING
                && !AppointmentPaymentCalculator.HasDepositPaid(appointment)
                && appointment.DepositDeadlineAt != null)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_CONFIRMED_WAITING_DEPOSIT, ErrorCodes.ERR_APPOINTMENT_ALREADY_THIS_STATUS);
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                if (request.Status == AppointmentConst.STATUS_CONFIRMED
                    && appointment.Status == AppointmentConst.STATUS_PENDING
                    && !AppointmentPaymentCalculator.HasDepositPaid(appointment))
                {
                    var now = DateTimeHelper.UtcNow();
                    appointment.DepositRequestedAt = now;
                    appointment.DepositDeadlineAt = now.AddHours(24);
                    appointment.Status = AppointmentConst.STATUS_CONFIRMED;
                    appointment.ConfirmedAt = now;
                    appointment.UpdatedAt = now;
                    appointment.UpdatedBy = request.UserId;
                    if (!string.IsNullOrWhiteSpace(request.Note))
                        appointment.Note = request.Note;

                    appointmentSqlRepository.Update(appointment);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    transaction.Commit();

                    await PublishStatusChangedAsync(
                        appointment,
                        request.UserId,
                        confirmedWaitingDeposit: true,
                        cancellationToken);

                    return Result<object>.Success("Đã xác nhận lịch. Khách có 24 giờ để đặt cọc qua VNPAY.");
                }

                var paidBeforeCancel = appointment.PaidAmount;

                if (request.Status == AppointmentConst.STATUS_IN_SERVICE
                    && appointment.Status == AppointmentConst.STATUS_WAITING
                    && appointment.TimeStartService == null)
                {
                    appointment.TimeStartService = DateTimeHelper.UtcNow();
                }

                appointment.Status = request.Status;

                var nowTime = DateTimeHelper.UtcNow();
                appointment.UpdatedAt = nowTime;
                appointment.UpdatedBy = request.UserId;
                if (!string.IsNullOrWhiteSpace(request.Note))
                    appointment.Note = request.Note;

                if (request.Status == AppointmentConst.STATUS_CONFIRMED)
                {
                    appointment.ConfirmedAt = nowTime;
                }
                else if (request.Status == AppointmentConst.STATUS_COMPLETED)
                {
                    appointment.CompletedAt = nowTime;
                }

                if (request.Status == AppointmentConst.STATUS_COMPLETED
                    || request.Status == AppointmentConst.STATUS_CANCELLED
                    || request.Status == AppointmentConst.STATUS_NO_SHOW)
                {
                    await BookingPositionReleaseService.ReleasePositionIfNeededAsync(
                        appointment, bookingPositionSqlRepository, cancellationToken);
                }

                if (request.Status == AppointmentConst.STATUS_CANCELLED && paidBeforeCancel > 0)
                {
                    Wallet wallet;
                    try
                    {
                        wallet = await WalletManager.GetOrCreateWalletAsync(appointment.CreatedByUserId, userSqlRepository, walletSqlRepository, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return Result<object>.BadRequest(ex.Message);
                    }

                    wallet.Balance += paidBeforeCancel;
                    walletSqlRepository.Update(wallet);

                    walletTransactionSqlRepository.Add(new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = paidBeforeCancel,
                        BalanceAfter = wallet.Balance,
                        Type = WalletTransactionConst.TYPE_REFUND_FROM_APPOINTMENT,
                        Note = $"Hoàn tiền do thu ngân hủy lịch hẹn #{appointment.Id}",
                        Status = WalletTransactionConst.STATUS_SUCCESS,
                        CreatedAt = DateTimeHelper.UtcNow(),
                        CreatedBy = request.UserId
                    });

                    if (appointment.Payments != null)
                    {
                        foreach (var p in appointment.Payments)
                        {
                            if (p.Status == AppointmentPaymentConst.STATUS_PAID)
                            {
                                p.Status = AppointmentPaymentConst.STATUS_REFUNDED;
                            }
                        }
                    }
                }

                appointmentSqlRepository.Update(appointment);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();
                await PublishStatusChangedAsync(
                    appointment,
                    request.UserId,
                    confirmedWaitingDeposit: false,
                    cancellationToken);
                return Result<object>.Success("Cập nhật trạng thái thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task PublishStatusChangedAsync(
            Appointment appointment,
            int? actorUserId,
            bool confirmedWaitingDeposit,
            CancellationToken cancellationToken)
        {
            var staffUserId = await staffSqlRepository.AsQueryable(asNoTracking: true)
                .Where(s => s.Id == appointment.StaffId)
                .Select(s => (int?)s.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            var customerName = appointment.CreatedByUser?.Customer?.FullName
                ?? appointment.CreatedByUser?.Username
                ?? "khách";

            var actorName = "Thu ngân";
            if (actorUserId is int uid)
            {
                var actor = await userSqlRepository.AsQueryable(asNoTracking: true)
                    .Where(u => u.Id == uid)
                    .Select(u => u.Staff != null
                        ? u.Staff.FullName
                        : (u.Customer != null ? u.Customer.FullName : u.Username))
                    .FirstOrDefaultAsync(cancellationToken);
                if (!string.IsNullOrWhiteSpace(actor))
                    actorName = actor;
            }

            var at = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");
            var statusLabel = StatusLabel(appointment.Status);
            var staffMessage = confirmedWaitingDeposit
                ? $"{actorName} vừa xác nhận lịch hẹn #{appointment.Id} của khách {customerName} vào lúc {at}."
                : $"{actorName} vừa cập nhật lịch hẹn #{appointment.Id} của khách {customerName} sang \"{statusLabel}\" vào lúc {at}.";
            var customerMessage = confirmedWaitingDeposit
                ? $"{actorName} vừa xác nhận lịch hẹn #{appointment.Id} của bạn vào lúc {at}. Vui lòng đặt cọc trong 24 giờ."
                : $"{actorName} vừa cập nhật lịch hẹn #{appointment.Id} của bạn sang \"{statusLabel}\" vào lúc {at}.";

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_APPOINTMENT_STATUS_CHANGED,
                Title = "Cập nhật lịch hẹn",
                Message = staffMessage,
                CustomerMessage = customerMessage,
                SalonId = appointment.SalonId,
                CustomerUserId = appointment.CreatedByUserId,
                StaffUserId = staffUserId,
                Payload = new BookingNotificationPayload
                {
                    AppointmentId = appointment.Id,
                    StaffId = appointment.StaffId,
                    Status = appointment.Status,
                    CustomerName = customerName,
                    AppointmentDate = appointment.AppointmentDate,
                },
            }, cancellationToken);
        }

        private static string StatusLabel(int status) => status switch
        {
            AppointmentConst.STATUS_PENDING => "chờ xác nhận",
            AppointmentConst.STATUS_CONFIRMED => "đã xác nhận",
            AppointmentConst.STATUS_WAITING => "chờ phục vụ",
            AppointmentConst.STATUS_IN_SERVICE => "đang phục vụ",
            AppointmentConst.STATUS_COMPLETED => "hoàn thành",
            AppointmentConst.STATUS_CANCELLED => "đã hủy",
            AppointmentConst.STATUS_NO_SHOW => "khách không đến",
            _ => $"trạng thái {status}",
        };
    }
}
