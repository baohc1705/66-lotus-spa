using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Cashier.Commands.PayAppointment
{
    public sealed class PayAppointmentHandler(
        IAppointmentSqlRepository appointmentSqlRepository,
        IUserSqlRepository userSqlRepository,
        IWalletSqlRepository walletSqlRepository,
        IWalletTransactionSqlRepository walletTransactionSqlRepository,
        ILoyaltyPointService loyaltyPointService,
        ISqlUnitOfWork sqlUnitOfWork)
        : IRequestHandler<PayAppointmentCommand, Result<object>>
    {
        private static readonly HashSet<string> AllowedMethods =
            new(StringComparer.OrdinalIgnoreCase) { "cash", "transfer", "card", "wallet" };

        private static readonly Dictionary<string, string> MethodLabels = new(StringComparer.OrdinalIgnoreCase)
        {
            ["cash"] = "Tiền mặt",
            ["transfer"] = "Chuyển khoản",
            ["card"] = "Thẻ / POS",
            ["wallet"] = "Ví khách hàng"
        };

        public async Task<Result<object>> Handle(
            PayAppointmentCommand request,
            CancellationToken cancellationToken)
        {
            if (!AllowedMethods.Contains(request.PaymentMethod))
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_INVALID_PAYMENT_METHOD, ErrorCodes.ERR_APPOINTMENT_INVALID_PAYMENT_METHOD);
            }

            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

            if (appointment == null)
            {
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_ALREADY_PAID);
            }

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
            {
                return Result<object>.BadRequest(
                    "Chỉ thanh toán khi dịch vụ đã hoàn tất và lịch ở trạng thái chờ thanh toán.");
            }

            if (!AppointmentPaymentCalculator.HasDepositPaid(appointment))
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NOT_DEPOSITED_YET, ErrorCodes.ERR_APPOINTMENT_NOT_DEPOSITED_YET);
            }

            var amount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);
            if (amount <= 0)
            {
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NO_REMAINING_AMOUNT, ErrorCodes.ERR_APPOINTMENT_NO_REMAINING_AMOUNT);
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                var methodLabel = MethodLabels[request.PaymentMethod];
                var note = string.IsNullOrWhiteSpace(request.Note)
                    ? $"Thanh toán phần còn lại — {methodLabel}"
                    : $"Thanh toán phần còn lại — {methodLabel}: {request.Note.Trim()}";

                int methodConst = request.PaymentMethod.ToLower() switch
                {
                    "cash" => AppointmentPaymentConst.METHOD_CASH,
                    "transfer" => AppointmentPaymentConst.METHOD_BANK_TRANSFER,
                    //"card" => AppointmentPaymentConst.METHOD_CREDIT_CARD,
                    "wallet" => AppointmentPaymentConst.METHOD_WALLET,
                    _ => AppointmentPaymentConst.METHOD_CASH
                };

                // Nếu thu ngân chọn phương thức Ví, thực hiện trừ tiền ví của khách
                if (methodConst == AppointmentPaymentConst.METHOD_WALLET)
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

                    if (wallet.Balance < amount)
                    {
                        transaction.Rollback();
                        return Result<object>.BadRequest($"Ví của khách hàng không đủ số dư (Hiện có: {wallet.Balance:N0}đ).");
                    }

                    wallet.Balance -= amount;
                    walletSqlRepository.Update(wallet);

                    var walletTx = new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = -amount,
                        BalanceAfter = wallet.Balance,
                        Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                        Note = $"Thu ngân trừ tiền ví thanh toán cho lịch hẹn #{appointment.Id}",
                        Status = WalletTransactionConst.STATUS_SUCCESS,
                        CreatedAt = DateTimeHelper.UtcNow(),
                        CreatedBy = request.UserId!.Value
                    };
                    walletTransactionSqlRepository.Add(walletTx);
                }

                if (!AppointmentPaymentRecorder.TryRecordPayment(
                        appointment,
                        AppointmentPaymentConst.PHASE_FINAL_PAYMENT,
                        amount,
                        methodConst,
                        null,
                        note,
                        out var error))
                {
                    return Result<object>.BadRequest(error!);
                }

                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;

                appointmentSqlRepository.Update(appointment);
                
                // Gọi service để cộng điểm và kiểm tra tự động nâng hạng thẻ thành viên
                // Tính điểm dựa trên TỔNG tiền dịch vụ (TotalAmount) — bao gồm cả phần cọc đã thanh toán trước
                // Việc lưu các thay đổi của thẻ và lịch sử sẽ được thực thi chung trong SaveChangeAsync dưới đây
                if (appointment.TotalAmount > 0)
                {
                    await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                        appointment.CreatedByUserId,
                        appointment.TotalAmount,
                        request.UserId!.Value,
                        cancellationToken);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);

                transaction.Commit();

                return Result<object>.Success("Thanh toán thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
