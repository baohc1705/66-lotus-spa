using _66SMS.Application.Abstractions.Services;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.PayAppointment
{
    public class PayAppointmentHandler : IRequestHandler<PayAppointmentCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletSqlRepository;
        private readonly IWalletTransactionSqlRepository walletTransactionSqlRepository;
        private readonly ILoyaltyPointService loyaltyPointService;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public PayAppointmentHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            IWalletTransactionSqlRepository walletTransactionSqlRepository,
            ILoyaltyPointService loyaltyPointService,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.walletSqlRepository = walletSqlRepository;
            this.walletTransactionSqlRepository = walletTransactionSqlRepository;
            this.loyaltyPointService = loyaltyPointService;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(PayAppointmentCommand request, CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (AppointmentPaymentCalculator.IsFullyPaid(appointment))
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_ALREADY_PAID);

            if (!AppointmentStatusTransitions.CanPayBalance(appointment.Status))
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_CANNOT_PAY_BALANCE, ErrorCodes.ERR_APPOINTMENT_PAYMENT_INVALID);

            if (!AppointmentPaymentCalculator.HasDepositPaid(appointment))
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NOT_DEPOSITED_YET, ErrorCodes.ERR_APPOINTMENT_NOT_DEPOSITED_YET);

            var amount = AppointmentPaymentCalculator.GetRemainingAmount(appointment);
            if (amount <= 0)
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_NO_REMAINING_AMOUNT, ErrorCodes.ERR_APPOINTMENT_NO_REMAINING_AMOUNT);

            var note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
            var methodConst = request.PaymentMethod.Trim().ToLowerInvariant() switch
            {
                "cash" => AppointmentPaymentConst.METHOD_CASH,
                "transfer" => AppointmentPaymentConst.METHOD_BANK_TRANSFER,
                "wallet" => AppointmentPaymentConst.METHOD_WALLET,
                _ => AppointmentPaymentConst.METHOD_CASH,
            };

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                if (methodConst == AppointmentPaymentConst.METHOD_WALLET)
                {
                    Wallet wallet;
                    try
                    {
                        wallet = await WalletManager.GetOrCreateWalletAsync(
                            appointment.CreatedByUserId, userSqlRepository, walletSqlRepository, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return Result<object>.BadRequest(ex.Message);
                    }

                    if (wallet.Balance < amount)
                    {
                        transaction.Rollback();
                        return Result<object>.BadRequest(WalletConst.MSG_WALLET_INSUFFICIENT_BALANCE, ErrorCodes.ERR_WALLET_INSUFFICIENT_BALANCE);
                    }

                    wallet.Balance -= amount;
                    walletSqlRepository.Update(wallet);

                    var walletTx = new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = -amount,
                        BalanceAfter = wallet.Balance,
                        Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                        Status = WalletTransactionConst.STATUS_SUCCESS,
                        CreatedAt = DateTimeHelper.UtcNow(),
                        CreatedBy = request.UserId,
                    };
                    if (note != null)
                        walletTx.Note = note;
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
                    transaction.Rollback();
                    return Result<object>.BadRequest(error!);
                }

                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;
                appointmentSqlRepository.Update(appointment);

                if (appointment.TotalAmount > 0 && request.UserId.HasValue)
                {
                    await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                        appointment.CreatedByUserId,
                        appointment.TotalAmount,
                        request.UserId.Value,
                        cancellationToken);
                }

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success(AppointmentConst.MSG_APPOINTMENT_PAY_SUCCESS);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
