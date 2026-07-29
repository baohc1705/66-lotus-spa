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
using System.Collections.Generic;
using System.Data;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Application.BookingService.Invoices.Commands.PayInvoice
{
    public class PayInvoiceHandler : IRequestHandler<PayInvoiceCommand, Result<object>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly ICustomerSqlRepository customerRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletRepository;
        private readonly IWalletTransactionSqlRepository walletTransactionRepository;
        private readonly ILoyaltyPointService loyaltyPointService;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public PayInvoiceHandler(
            IInvoiceSqlRepository invoiceRepository,
            IAppointmentSqlRepository appointmentRepository,
            ICustomerSqlRepository customerRepository,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletRepository,
            IWalletTransactionSqlRepository walletTransactionRepository,
            ILoyaltyPointService loyaltyPointService,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.invoiceRepository = invoiceRepository;
            this.appointmentRepository = appointmentRepository;
            this.customerRepository = customerRepository;
            this.userSqlRepository = userSqlRepository;
            this.walletRepository = walletRepository;
            this.walletTransactionRepository = walletTransactionRepository;
            this.loyaltyPointService = loyaltyPointService;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(PayInvoiceCommand request, CancellationToken cancellationToken)
        {
            var invoice = await invoiceRepository.AsQueryable(asNoTracking: false)
                .Include(i => i.Items)
                .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

            if (invoice == null)
            {
                return Result<object>.NotFound(InvoiceConst.MSG_NOT_FOUND, ErrorCodes.ERR_INVOICE_NOT_FOUND);
            }

            if (invoice.Status != InvoiceConst.STATUS_UNPAID && invoice.Status != InvoiceConst.STATUS_DRAFT)
            {
                return Result<object>.BadRequest("Hóa đơn đã được thanh toán hoặc không ở trạng thái chờ thanh toán.", ErrorCodes.ERR_INVOICE_ALREADY_PAID);
            }

            var remainingAmount = invoice.TotalAmount - invoice.PaidAmount;
            if (remainingAmount < 0) remainingAmount = 0;

            if (request.PaidAmount < remainingAmount)
            {
                return Result<object>.BadRequest("Số tiền thanh toán không đủ.", ErrorCodes.ERR_APPOINTMENT_PAYMENT_INVALID);
            }

            var change = request.PaidAmount - remainingAmount;

            Appointment? appointment = null;
            if (invoice.AppointmentId.HasValue)
            {
                appointment = await appointmentRepository.AsQueryable(asNoTracking: false)
                    .Include(a => a.Payments)
                    .FirstOrDefaultAsync(a => a.Id == invoice.AppointmentId.Value, cancellationToken);
            }

            Customer? customer = null;
            if (invoice.CustomerId.HasValue)
            {
                customer = await customerRepository.AsQueryable(asNoTracking: false)
                    .Include(c => c.MembershipCard)
                        .ThenInclude(mc => mc!.Tier)
                    .FirstOrDefaultAsync(c => c.Id == invoice.CustomerId.Value, cancellationToken);
            }

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
              
                if (request.PaymentMethod == InvoiceConst.PAYMENT_WALLET)
                {
                    int? walletUserId = appointment?.CreatedByUserId ?? customer?.UserId;
                    if (!walletUserId.HasValue)
                    {
                        return Result<object>.BadRequest("Không thể thanh toán bằng ví vì khách hàng không có tài khoản người dùng.", ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                    }

                    Wallet wallet;
                    try
                    {
                        wallet = await WalletManager.GetOrCreateWalletAsync(walletUserId.Value, userSqlRepository, walletRepository, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        return Result<object>.BadRequest(ex.Message, ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                    }

                    if (wallet.Balance < remainingAmount)
                    {
                        return Result<object>.BadRequest($"Ví của khách hàng không đủ số dư (Hiện có: {wallet.Balance:N0}đ).", ErrorCodes.ERR_INVOICE_NOT_ENOUGH_POINTS);
                    }

                    wallet.Balance -= remainingAmount;
                    walletRepository.Update(wallet);

                    var walletTx = new WalletTransaction
                    {
                        WalletId = wallet.Id,
                        Amount = -remainingAmount,
                        BalanceAfter = wallet.Balance,
                        Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                        Note = $"Thanh toán phần còn lại cho hóa đơn #{invoice.InvoiceCode}",
                        Status = WalletTransactionConst.STATUS_SUCCESS,
                        CreatedAt = DateTimeHelper.UtcNow(),
                        CreatedBy = request.CashierId ?? 0
                    };
                    walletTransactionRepository.Add(walletTx);
                }

             
                invoice.PaidAmount = invoice.TotalAmount;
                invoice.ChangeAmount = change;
                invoice.PaymentMethod = request.PaymentMethod;
                invoice.Status = InvoiceConst.STATUS_PAID;
                invoice.Note = request.Note;
                if (request.CashierId.HasValue)
                    invoice.CashierId = request.CashierId;
                invoice.UpdatedAt = DateTimeHelper.UtcNow();
                invoice.UpdatedBy = request.CashierId;
                invoiceRepository.Update(invoice);

         
                if (appointment != null)
                {
                    int appointmentMethod = request.PaymentMethod switch
                    {
                        InvoiceConst.PAYMENT_CASH => AppointmentPaymentConst.METHOD_CASH,
                        InvoiceConst.PAYMENT_BANK_TRANSFER => AppointmentPaymentConst.METHOD_BANK_TRANSFER,
                        InvoiceConst.PAYMENT_WALLET => AppointmentPaymentConst.METHOD_WALLET,
                        _ => AppointmentPaymentConst.METHOD_CASH
                    };

                    string paymentNote = $"Thanh toán hóa đơn #{invoice.InvoiceCode}";
                    if (!string.IsNullOrWhiteSpace(request.Note))
                    {
                        paymentNote += $": {request.Note.Trim()}";
                    }

                    if (remainingAmount > 0)
                    {
                        if (!AppointmentPaymentRecorder.TryRecordPayment(
                                appointment,
                                AppointmentPaymentConst.PHASE_FINAL_PAYMENT,
                                remainingAmount,
                                appointmentMethod,
                                null,
                                paymentNote,
                                out var error))
                        {
                            transaction.Rollback();
                            return Result<object>.BadRequest(error!);
                        }
                    }

                    appointment.UpdatedAt = DateTimeHelper.UtcNow();
                    appointment.UpdatedBy = request.CashierId;
                    appointmentRepository.Update(appointment);
                }

        
                int earnedPoints = 0;
                if (customer != null)
                {
                    decimal multiplier = customer.MembershipCard?.Tier?.PointMultiplier ?? 1m;
                    earnedPoints = loyaltyPointService.CalculateEarnedPoints(invoice.TotalAmount, multiplier);

                    if (earnedPoints > 0)
                    {
                        invoice.LoyaltyPointsEarned = earnedPoints;

                        if (customer.UserId.HasValue)
                        {
                            await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                                customer.UserId.Value,
                                invoice.TotalAmount,
                                request.CashierId ?? 0,
                                cancellationToken);
                        }
                        else
                        {
                            customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) + earnedPoints;
                        }
                    }

                    customer.LastPurchaseAt = DateTimeHelper.UtcNow();
                    customer.FirstPurchaseAt ??= DateTimeHelper.UtcNow();
                    customer.UpdatedAt = DateTimeHelper.UtcNow();
                    customerRepository.Update(customer);
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
