using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.BookingService.Cashier.Commands.UpdateAppointmentStatus
{
    public sealed class UpdateAppointmentStatusHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IUserSqlRepository userSqlRepository,
        IWalletSqlRepository walletSqlRepository,
        IWalletTransactionSqlRepository walletTransactionSqlRepository,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<UpdateAppointmentStatusCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            UpdateAppointmentStatusCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable()
                .Include(a => a.Payments)
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
                    var now = DateTime.UtcNow;
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

                    return Result<object>.Success(
                        "Đã xác nhận lịch. Khách có 24 giờ để đặt cọc qua VNPAY.");
                }

                var paidBeforeCancel = appointment.PaidAmount;
                appointment.Status = request.Status;

                var nowTime = DateTime.UtcNow;
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
                        CreatedAt = DateTime.UtcNow,
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

                return Result<object>.Success("Cập nhật trạng thái thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
