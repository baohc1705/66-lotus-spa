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
                .Include(a => a.Histories)
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

            // TODO: Bổ sung logic IsCashierTransition trong AppointmentStatusTransitions nếu cần
            // if (!AppointmentStatusTransitions.IsCashierTransition(appointment.Status, request.Status))
            // {
            //     return Result<object>.BadRequest(
            //         "Thu ngân chỉ có thể duyệt (chờ phục vụ) hoặc hủy lịch đang chờ xác nhận.");
            // }

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
                    // Mặc định cho 24h để đặt cọc
                    appointment.DepositDeadlineAt = now.AddHours(24);

                    appointment.Status = AppointmentConst.STATUS_CONFIRMED;

                    appointment.Histories ??= new List<AppointmentHistory>();
                    appointment.Histories.Add(new AppointmentHistory
                    {
                        OldStatus = AppointmentConst.STATUS_PENDING,
                        NewStatus = AppointmentConst.STATUS_CONFIRMED,
                        Note = request.Note ?? "Thu ngân xác nhận lịch — yêu cầu đặt cọc trong 24h",
                        CreatedBy = request.UserId,
                        CreatedAt = now
                    });

                    appointmentSqlRepository.Update(appointment);
                    await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                    transaction.Commit();

                    return Result<object>.Success(
                        "Đã xác nhận lịch. Khách có 24 giờ để đặt cọc qua VNPAY.");
                }

                var oldStatus = appointment.Status;
                var paidBeforeCancel = appointment.PaidAmount;
                appointment.Status = request.Status;

                // Xử lý hoàn tiền khi Hủy (Cancel)
                if (request.Status == AppointmentConst.STATUS_CANCELLED && paidBeforeCancel > 0)
                {
                    // Hoàn tiền vào Wallet
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

                appointment.Histories ??= new List<AppointmentHistory>();
                appointment.Histories.Add(new AppointmentHistory
                {
                    OldStatus = oldStatus,
                    NewStatus = request.Status,
                    Note = request.Note ?? (request.Status switch
                    {
                        AppointmentConst.STATUS_WAITING => "Thu ngân duyệt lịch online",
                        AppointmentConst.STATUS_CANCELLED when paidBeforeCancel > 0
                            => $"Thu ngân từ chối lịch online (cần hoàn 100% — {paidBeforeCancel:N0}đ)",
                        AppointmentConst.STATUS_CANCELLED => "Thu ngân từ chối lịch online",
                        _ => "Thu ngân cập nhật",
                    }),
                    CreatedBy = request.UserId,
                    CreatedAt = DateTime.UtcNow
                });

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
