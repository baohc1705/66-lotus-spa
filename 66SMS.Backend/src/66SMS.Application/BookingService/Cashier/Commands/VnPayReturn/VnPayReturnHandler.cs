using _66SMS.Application.Abstractions.Services;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayReturn
{
    public sealed class VnPayReturnHandler : IRequestHandler<VnPayReturnCommand, Result<VnPayReturnDto>>
    {
        private readonly IVnPayService vnPayService;
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IWalletSqlRepository walletRepository;
        private readonly IWalletTransactionSqlRepository walletTransactionRepository;
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly ILoyaltyPointService loyaltyPointService;
        private readonly ISqlUnitOfWork unitOfWork;

        public VnPayReturnHandler(
            IVnPayService vnPayService,
            IAppointmentSqlRepository appointmentRepository,
            IWalletSqlRepository walletRepository,
            IWalletTransactionSqlRepository walletTransactionRepository,
            IInvoiceSqlRepository invoiceRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            ILoyaltyPointService loyaltyPointService,
            ISqlUnitOfWork unitOfWork)
        {
            this.vnPayService = vnPayService;
            this.appointmentRepository = appointmentRepository;
            this.walletRepository = walletRepository;
            this.walletTransactionRepository = walletTransactionRepository;
            this.invoiceRepository = invoiceRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.loyaltyPointService = loyaltyPointService;
            this.unitOfWork = unitOfWork;
        }

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

            int? depositPercent = null;
            if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
                depositPercent = await AppointmentPaymentCalculator.GetEffectiveDepositPercentAsync(
                    appointment,
                    configAppointmentSqlRepository,
                    cancellationToken);

                if (depositPercent == null)
                    return Result<VnPayReturnDto>.BadRequest(
                        ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                        ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);
            }

            var apply = AppointmentPaymentApplyService.ApplyVnPaySuccess(
                appointment,
                result.Phase,
                result.TransactionId,
                depositPercent);

            if (!apply.IsSuccess)
                return Result<VnPayReturnDto>.BadRequest(apply.Message, apply.ErrorCode);

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

            if (result.Phase == AppointmentPaymentConst.PHASE_FINAL_PAYMENT && apply.IsSuccess)
            {
                var invoice = await invoiceRepository.AsQueryable(asNoTracking: false)
                    .Where(i => i.AppointmentId == appointment.Id
                        && i.Status != InvoiceConst.STATUS_CANCELLED)
                    .OrderByDescending(i => i.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (invoice != null
                    && (invoice.Status == InvoiceConst.STATUS_UNPAID
                        || invoice.Status == InvoiceConst.STATUS_DRAFT))
                {
                    invoice.PaidAmount = invoice.TotalAmount;
                    invoice.PaymentMethod = InvoiceConst.PAYMENT_VNPAY;
                    invoice.TransactionId = result.TransactionId;
                    invoice.Status = InvoiceConst.STATUS_PAID;
                    invoice.UpdatedAt = DateTimeHelper.UtcNow();
                    invoiceRepository.Update(invoice);
                }
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
