using _66SMS.Application.Abstractions;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Application.DTOs.Cashier;
using _66SMS.Contracts.Enumerations;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using _66SMS.Application.BookingService.Helpers;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn
{
    public sealed class VnPayReturnHandler(
        IVnPayService vnPayService,
        IAppointmentSqlRepository appointmentRepository,
        IWalletSqlRepository walletRepository,
        IWalletTransactionSqlRepository walletTransactionRepository,
        ILoyaltyPointService loyaltyPointService,
        ISqlUnitOfWork unitOfWork)
        : IRequestHandler<VnPayReturnCommand, Result<VnPayReturnDto>>
    {
        public async Task<Result<VnPayReturnDto>> Handle(VnPayReturnCommand request, CancellationToken cancellationToken)
        {
            var result = vnPayService.PaymentExecute(request.QueryData);

            if (!result.Success)
                return Result<VnPayReturnDto>.BadRequest(
                    AppointmentPaymentConst.MSG_PAYMENT_TRANSACTION_FAILED,
                    ErrorCodes.ERR_PAYMENT_TRANSACTION_FAILED);

            if (result.IsWalletTopUp)
            {
                var topUp = await WalletTopUpApplyService.ApplyAsync(
                    result.WalletId,
                    result.Amount,
                    result.PaymentId,
                    walletRepository,
                    walletTransactionRepository,
                    cancellationToken);

                if (!topUp.IsSuccess)
                {
                    if (topUp.Code == 404)
                        return Result<VnPayReturnDto>.NotFound(topUp.Message, ErrorCodes.ERR_WALLET_NOT_FOUND);

                    return Result<VnPayReturnDto>.BadRequest(topUp.Message, ErrorCodes.ERR_WALLET_INVALID);
                }

                await unitOfWork.SaveChangeAsync(cancellationToken);

                return Result<VnPayReturnDto>.Success(new VnPayReturnDto
                {
                    AppointmentId = 0,
                    PaymentPhase = "topup",
                    Message = topUp.Message
                });
            }

            var phaseKey = result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT ? "deposit" : "balance";

            var appointment = await appointmentRepository.AsQueryable()
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == result.AppointmentId, cancellationToken);

            if (appointment == null)
                return Result<VnPayReturnDto>.NotFound(
                    AppointmentPaymentConst.MSG_PAYMENT_ORDER_NOT_FOUND,
                    ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND);

            var apply = AppointmentPaymentApplyService.ApplyVnPaySuccess(appointment, result.Phase, result.TransactionId);
            if (!apply.IsSuccess)
                return Result<VnPayReturnDto>.BadRequest(apply.Message);

            appointmentRepository.Update(appointment);

            if (result.Phase == AppointmentPaymentConst.PHASE_FINAL_PAYMENT
                && apply.Data is bool isNewlyPaid && isNewlyPaid
                && appointment.TotalAmount > 0)
            {
                await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                    appointment.CreatedByUserId,
                    appointment.TotalAmount,
                    appointment.CreatedByUserId,
                    cancellationToken);
            }

            await unitOfWork.SaveChangeAsync(cancellationToken);

            return Result<VnPayReturnDto>.Success(new VnPayReturnDto
            {
                AppointmentId = result.AppointmentId,
                PaymentPhase = phaseKey,
                Message = apply.Message
            });
        }
    }
}
