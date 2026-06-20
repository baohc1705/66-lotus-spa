using _66SMS.Application.Services.Appointments;
using _66SMS.Application.Services.Wallets;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet
{
    public sealed class PayDepositWithWalletHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IUserSqlRepository userSqlRepository,
        IWalletSqlRepository walletSqlRepository,
        IWalletTransactionSqlRepository walletTransactionSqlRepository,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<PayDepositWithWalletCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            PayDepositWithWalletCommand request,
            CancellationToken cancellationToken)
        {
            var userId = request.UserId;
            if (userId == null)
            {
                return Result<object>.Unauthorized("Vui lòng đăng nhập.");
            }

            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Histories)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (appointment.CreatedByUserId != userId)
            {
                return Result<object>.Forbidden("Bạn không có quyền thanh toán cho lịch hẹn này.");
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(
                    appointment.TotalAmount,
                    appointment.DepositPercent ?? AppointmentPaymentCalculator.DefaultDepositPercent);

                if (depositAmount <= 0)
                {
                    return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_DEPOSIT_INVALID_AMOUNT, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);
                }

                if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                {
                    return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_DEPOSIT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_DEPOSIT_ALREADY_PAID);
                }

                Wallet wallet;
                try
                {
                    wallet = await WalletManager.GetOrCreateWalletAsync((int)request.UserId!, userSqlRepository, walletSqlRepository, cancellationToken);
                }
                catch (Exception ex)
                {
                    return Result<object>.BadRequest(ex.Message);
                }

                if (wallet.Balance < depositAmount)
                {
                    return Result<object>.BadRequest(WalletConst.MSG_WALLET_INSUFFICIENT_BALANCE, ErrorCodes.ERR_WALLET_INSUFFICIENT_BALANCE);
                }

                // Trừ tiền ví
                wallet.Balance -= depositAmount;
                if (wallet.Id > 0)
                {
                    walletSqlRepository.Update(wallet);
                }

                // Thêm transaction ví
                var walletTx = new WalletTransaction
                {
                    Wallet = wallet,
                    Amount = -depositAmount,
                    BalanceAfter = wallet.Balance,
                    Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                    Note = $"Thanh toán tiền cọc bằng ví cho lịch hẹn #{appointment.Id}",
                    Status = WalletTransactionConst.STATUS_SUCCESS,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                walletTransactionSqlRepository.Add(walletTx);

                // Cập nhật Appointment
                if (!AppointmentPaymentRecorder.TryRecordPayment(
                        appointment,
                        AppointmentPaymentConst.PHASE_DEPOSIT,
                        depositAmount,
                        AppointmentPaymentConst.METHOD_WALLET,
                        null,
                        "Thanh toán cọc qua Ví",
                        out var error))
                {
                    return Result<object>.BadRequest(error!);
                }

                // Cập nhật trạng thái appointment
                var oldStatus = appointment.Status;
                appointment.Status = AppointmentConst.STATUS_CONFIRMED;

                appointment.Histories ??= new List<AppointmentHistory>();
                appointment.Histories.Add(new AppointmentHistory
                {
                    OldStatus = oldStatus,
                    NewStatus = AppointmentConst.STATUS_CONFIRMED,
                    Note = "Thanh toán cọc bằng Ví thành công",
                    CreatedBy = request.UserId,
                    ChangedBy = request.UserId,
                    CreatedAt = DateTime.UtcNow
                });

                appointmentSqlRepository.Update(appointment);
                
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                // Link AppointmentPaymentId to WalletTransaction after SaveChanges gets the IDs
                // However, EF Core navigation properties might not easily link newly created in same context if not explicitly saved.
                // We'll skip linking AppointmentPaymentId into WalletTransaction for now, or just let it be null.
                
                transaction.Commit();

                return Result<object>.Success("Thanh toán tiền cọc thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
