using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Appointments.Commands.PostponeAppointment
{
    public sealed class PostponeAppointmentHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IUserSqlRepository userSqlRepository,
        IWalletSqlRepository walletSqlRepository,
        IWalletTransactionSqlRepository walletTransactionSqlRepository,
        IBookingPositionSqlRepository bookingPositionSqlRepository,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<PostponeAppointmentCommand, Result<object>>
    {
        public async Task<Result<object>> Handle(
            PostponeAppointmentCommand request,
            CancellationToken cancellationToken)
        {
            var userId = request.UserId;
            if (userId == null)
            {
                return Result<object>.Unauthorized("Vui lòng đăng nhập.");
            }

            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (appointment.CreatedByUserId != userId)
            {
                return Result<object>.Forbidden("Bạn không có quyền hoãn lịch hẹn này.");
            }

            if (appointment.Status == AppointmentConst.STATUS_CANCELLED)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_CANCELLED, ErrorCodes.ERR_APPOINTMENT_CANCELLED);
            }

            if (appointment.Status == AppointmentConst.STATUS_COMPLETED || 
                appointment.Status == AppointmentConst.STATUS_NO_SHOW || 
                AppointmentPaymentCalculator.IsFullyPaid(appointment))
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_CANNOT_POSTPONE_COMPLETED, ErrorCodes.ERR_APPOINTMENT_CANNOT_POSTPONE);
            }

            if (appointment.Status != AppointmentConst.STATUS_WAITING)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_POSTPONE_ONLY_PAID_PENDING, ErrorCodes.ERR_APPOINTMENT_CANNOT_POSTPONE);
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var paidAmount = appointment.PaidAmount;
                appointment.Status = AppointmentConst.STATUS_CANCELLED;

                if (paidAmount > 0)
                {
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

                    // Hoàn tiền vào Wallet
                    Wallet wallet;
                    try
                    {
                        wallet = await WalletManager.GetOrCreateWalletAsync((int)request.UserId!, userSqlRepository, walletSqlRepository, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        return Result<object>.BadRequest(ex.Message);
                    }

                    wallet.Balance += paidAmount;
                    if (wallet.Id > 0)
                    {
                        walletSqlRepository.Update(wallet);
                    }

                    var walletTx = new WalletTransaction
                    {
                        Wallet = wallet,
                        Amount = paidAmount,
                        BalanceAfter = wallet.Balance,
                        Type = WalletTransactionConst.TYPE_REFUND_FROM_APPOINTMENT,
                        Note = $"Hoàn tiền cọc do hoãn/hủy lịch hẹn #{appointment.Id}",
                        Status = WalletTransactionConst.STATUS_SUCCESS,
                        CreatedAt = DateTimeHelper.UtcNow(),
                        CreatedBy = userId
                    };
                    walletTransactionSqlRepository.Add(walletTx);
                }

                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;

                await BookingPositionReleaseService.ReleasePositionIfNeededAsync(
                    appointment, bookingPositionSqlRepository, cancellationToken);

                appointmentSqlRepository.Update(appointment);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                return Result<object>.Success("Hoãn lịch và hoàn tiền cọc vào ví thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
