using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Messages;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
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
        IInvoiceSqlRepository invoiceSqlRepository,
        IConfigAppointmentSqlRepository configAppointmentSqlRepository,
        IEmailTemplateFactory emailTemplateFactory,
        IDomainEventPublisher domainEventPublisher,
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

            DepositInvoiceEmailData? emailData = null;

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var depositPercent = await AppointmentPaymentCalculator.GetEffectiveDepositPercentAsync(
                    appointment,
                    configAppointmentSqlRepository,
                    cancellationToken);
                var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(
                    appointment.TotalAmount,
                    depositPercent);

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

                wallet.Balance -= depositAmount;
                if (wallet.Id > 0)
                {
                    walletSqlRepository.Update(wallet);
                }

                var walletTx = new WalletTransaction
                {
                    Wallet = wallet,
                    Amount = -depositAmount,
                    BalanceAfter = wallet.Balance,
                    Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                    Note = $"Thanh toán tiền cọc bằng ví cho lịch hẹn #{appointment.Id}",
                    Status = WalletTransactionConst.STATUS_SUCCESS,
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = userId
                };
                walletTransactionSqlRepository.Add(walletTx);

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

                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;
                appointmentSqlRepository.Update(appointment);

                emailData = await TryPrepareDepositInvoiceAsync(appointment.Id, cancellationToken);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                if (emailData != null)
                {
                    await SendDepositInvoiceEmailAsync(emailData, cancellationToken);
                }

                return Result<object>.Success("Thanh toán tiền cọc thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        private async Task<DepositInvoiceEmailData?> TryPrepareDepositInvoiceAsync(
            int appointmentId,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .Include(a => a.Services!)
                    .ThenInclude(s => s.Service)
                .Include(a => a.TimeSlot)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Customer!)
                        .ThenInclude(c => c!.MembershipCard!)
                            .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(a => a.Id == appointmentId, cancellationToken);

            if (appointment == null || !AppointmentPaymentCalculator.HasDepositPaid(appointment))
                return null;

            var hasExistingInvoice = await invoiceSqlRepository.AsQueryable()
                .AnyAsync(i => i.AppointmentId == appointment.Id && i.Status != InvoiceConst.STATUS_CANCELLED, cancellationToken);

            if (hasExistingInvoice)
                return null;

            var items = new List<InvoiceItem>();
            decimal subTotal = 0;

            if (appointment.Services != null)
            {
                foreach (var appService in appointment.Services)
                {
                    var quantity = appService.Quantity;
                    var unitPrice = appService.PriceSnapshot;
                    var lineTotal = unitPrice * quantity;
                    subTotal += lineTotal;

                    decimal? commissionRate = null;
                    decimal commissionAmount = 0;

                    if (appService.Service != null && appService.Service.CommissionRate.HasValue)
                    {
                        commissionRate = appService.Service.CommissionRate.Value;
                        commissionAmount = Math.Round(lineTotal * (commissionRate.Value / 100m), 0);
                    }

                    items.Add(new InvoiceItem
                    {
                        ItemType = InvoiceItemConst.TYPE_SERVICE,
                        RefId = appService.ServiceId,
                        ItemName = appService.Service?.Name ?? "Dịch vụ",
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        DiscountAmount = 0,
                        LineTotal = lineTotal,
                        StaffId = appointment.StaffId,
                        Status = InvoiceItemConst.STATUS_ACTIVE,
                        CommissionRate = commissionRate,
                        CommissionAmount = commissionAmount,
                    });
                }
            }

            var customer = appointment.CreatedByUser?.Customer;
            var (membershipDiscount, promoDiscount, membershipTierId) =
                AppointmentInvoiceDiscountHelper.Split(subTotal, appointment.TotalAmount, appointment.Note, customer);

            var invoiceCode = $"HD-{DateTimeHelper.UtcNow():yyyyMMddHHmmssfff}";

            invoiceSqlRepository.Add(new Invoice
            {
                InvoiceCode = invoiceCode,
                CustomerId = customer?.Id,
                CustomerName = customer?.FullName ?? appointment.CreatedByUser?.Username,
                CustomerPhone = customer?.Phone,
                AppointmentId = appointment.Id,
                SalonId = appointment.SalonId,
                SubTotal = subTotal,
                DiscountAmount = promoDiscount,
                MembershipTierId = membershipTierId,
                MembershipDiscountAmount = membershipDiscount,
                LoyaltyPointsUsed = 0,
                LoyaltyPointsValue = 0,
                LoyaltyPointsEarned = 0,
                TaxAmount = 0,
                TotalAmount = appointment.TotalAmount,
                PaidAmount = appointment.PaidAmount,
                ChangeAmount = 0,
                PaymentMethod = InvoiceConst.PAYMENT_WALLET,
                Status = InvoiceConst.STATUS_UNPAID,
                Note = $"Hóa đơn cọc lịch hẹn #{appointment.Id}",
                IssuedAt = DateTimeHelper.UtcNow(),
                CreatedAt = DateTimeHelper.UtcNow(),
                CreatedBy = appointment.CreatedByUserId,
                Items = items
            });

            var customerEmail = appointment.CreatedByUser?.Email;
            if (string.IsNullOrWhiteSpace(customerEmail))
                return null;

            var serviceName = appointment.Services != null && appointment.Services.Any()
                ? string.Join(", ", appointment.Services.Where(s => s.Service != null).Select(s => s.Service!.Name))
                : "Dịch vụ";

            return new DepositInvoiceEmailData(
                customerEmail,
                customer?.FullName ?? appointment.CreatedByUser?.Username ?? "Quý khách",
                serviceName,
                appointment.AppointmentDate.ToDateTime(appointment.TimeSlot?.StartTime ?? new TimeOnly(9, 0)),
                appointment.PaidAmount,
                appointment.TotalAmount - appointment.PaidAmount,
                invoiceCode);
        }

        private async Task SendDepositInvoiceEmailAsync(
            DepositInvoiceEmailData emailData,
            CancellationToken cancellationToken)
        {
            var mail = emailTemplateFactory.CreateDepositInvoiceEmail(
                emailData.ToEmail,
                emailData.CustomerName,
                emailData.ServiceName,
                emailData.AppointmentTime,
                emailData.DepositAmount,
                emailData.RemainingAmount,
                emailData.InvoiceCode);

            await domainEventPublisher.PublishAsync(new SendEmailEvent
            {
                ToEmail = mail.ToEmail,
                Subject = mail.Subject,
                HtmlBody = mail.HtmlBody,
            }, cancellationToken);
        }

        private sealed record DepositInvoiceEmailData(
            string ToEmail,
            string CustomerName,
            string ServiceName,
            DateTime AppointmentTime,
            decimal DepositAmount,
            decimal RemainingAmount,
            string InvoiceCode);
    }
}
