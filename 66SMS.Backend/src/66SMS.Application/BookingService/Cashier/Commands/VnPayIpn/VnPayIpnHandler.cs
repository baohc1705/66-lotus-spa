using _66SMS.Application.Abstractions;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Constants;
using _66SMS.Contracts.Helpers;
using _66SMS.Contracts.Messages;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Cashier.Commands.VnPayIpn
{
    public sealed class VnPayIpnHandler(
        IVnPayService vnPayService,
        IAppointmentSqlRepository appointmentRepository,
        IWalletSqlRepository walletRepository,
        IWalletTransactionSqlRepository walletTransactionRepository,
        IInvoiceSqlRepository invoiceRepository,
        IConfigAppointmentSqlRepository configAppointmentSqlRepository,
        ILoyaltyPointService loyaltyPointService,
        IEmailTemplateFactory emailTemplateFactory,
        IDomainEventPublisher domainEventPublisher,
        ISqlUnitOfWork unitOfWork)
        : IRequestHandler<VnPayIpnCommand, VnPayIpnResponse>
    {
        public async Task<VnPayIpnResponse> Handle(VnPayIpnCommand request, CancellationToken cancellationToken)
        {
            var result = vnPayService.PaymentExecute(request.QueryData);
            if (!result.Success && string.IsNullOrEmpty(result.VnPayResponseCode))
            {
                return VnPayIpnResponse.InvalidSignature();
            }
            if (result.IsWalletTopUp)
            {
                if (result.WalletId <= 0)
                    return VnPayIpnResponse.OrderNotFound();

                var walletExists = await walletRepository.AsQueryable(asNoTracking: true)
                    .AnyAsync(w => w.Id == result.WalletId, cancellationToken);

                if (!walletExists)
                    return VnPayIpnResponse.OrderNotFound();

                if (result.Success)
                {
                    var topUp = await WalletTopUpApplyService.ApplyAsync(
                        result.WalletId,
                        result.Amount,
                        result.PaymentId,
                        walletRepository,
                        walletTransactionRepository,
                        cancellationToken);

                    if (!topUp.IsSuccess && topUp.Code == 404)
                        return VnPayIpnResponse.OrderNotFound();

                    if (topUp.IsSuccess && topUp.Data is bool isNewlyCredited && !isNewlyCredited)
                        return VnPayIpnResponse.OrderAlreadyConfirmed();

                    if (topUp.IsSuccess && topUp.Data is bool newly && newly)
                        await unitOfWork.SaveChangeAsync(cancellationToken);
                }

                return VnPayIpnResponse.Success();
            }

           
            var appointment = await appointmentRepository.AsQueryable()
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == result.AppointmentId, cancellationToken);

            if (appointment == null)
                return VnPayIpnResponse.OrderNotFound();

      
            bool isAlreadyConfirmed;
            if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
            {
               
                isAlreadyConfirmed = !AppointmentStatusTransitions.CanPayDeposit(appointment);
            }
            else
            {
                isAlreadyConfirmed = !AppointmentStatusTransitions.CanPayBalance(appointment.Status);
            }
            
            if (isAlreadyConfirmed)
            {
                return VnPayIpnResponse.OrderAlreadyConfirmed();
            }
            if (result.Success)
            {
                var depositPercent = result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT
                    ? await AppointmentPaymentCalculator.GetEffectiveDepositPercentAsync(
                        appointment,
                        configAppointmentSqlRepository,
                        cancellationToken)
                    : (int?)null;

                var apply = AppointmentPaymentApplyService.ApplyVnPaySuccess(
                    appointment,
                    result.Phase,
                    result.TransactionId,
                    depositPercent);

              
                if (!apply.IsSuccess)
                {
                    return VnPayIpnResponse.OrderAlreadyConfirmed();
                }

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
                        invoice.ChangeAmount = 0;
                        invoice.PaymentMethod = InvoiceConst.PAYMENT_VNPAY;
                        invoice.TransactionId = result.TransactionId;
                        invoice.Status = InvoiceConst.STATUS_PAID;
                        invoice.UpdatedAt = DateTimeHelper.UtcNow();
                        invoiceRepository.Update(invoice);
                    }
                }

                appointmentRepository.Update(appointment);
                await unitOfWork.SaveChangeAsync(cancellationToken);

                if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
                {
                    await CreateDepositInvoiceAndSendEmailAsync(appointment.Id, cancellationToken);
                    await PublishDepositPaidAsync(appointment, cancellationToken);
                }
            }

            return VnPayIpnResponse.Success();
        }

        private async Task PublishDepositPaidAsync(
            Appointment appointment,
            CancellationToken cancellationToken)
        {
            var info = await appointmentRepository.AsQueryable(asNoTracking: true)
                .Where(a => a.Id == appointment.Id)
                .Select(a => new
                {
                    StaffUserId = a.Staff!.UserId,
                    CustomerName = a.CreatedByUser!.Customer!.FullName,
                })
                .FirstOrDefaultAsync(cancellationToken);

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_DEPOSIT_PAID,
                Title = "Đã thanh toán cọc",
                Message = $"Khách đã thanh toán cọc cho lịch hẹn #{appointment.Id}.",
                SalonId = appointment.SalonId,
                CustomerUserId = appointment.CreatedByUserId,
                StaffUserId = info?.StaffUserId,
                Payload = new BookingNotificationPayload
                {
                    AppointmentId = appointment.Id,
                    StaffId = appointment.StaffId,
                    Status = appointment.Status,
                    CustomerName = info?.CustomerName,
                    AppointmentDate = appointment.AppointmentDate,
                },
            }, cancellationToken);
        }

        private async Task CreateDepositInvoiceAndSendEmailAsync(
            int appointmentId,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentRepository.AsQueryable(asNoTracking: false)
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
                return;

            var hasExistingInvoice = await invoiceRepository.AsQueryable()
                .AnyAsync(i => i.AppointmentId == appointment.Id && i.Status != InvoiceConst.STATUS_CANCELLED, cancellationToken);

            if (hasExistingInvoice)
                return;

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
            var (membershipDiscount, promoDiscount, membershipTierId) = AppointmentInvoiceDiscountHelper.Split(subTotal, appointment.TotalAmount, appointment.Note, customer);

            var invoice = new Invoice
            {
                InvoiceCode = $"HD-COC-{DateTimeHelper.UtcNow():yyyyMMddHHmmssfff}",
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
                PaymentMethod = InvoiceConst.PAYMENT_BANK_TRANSFER,
                Status = InvoiceConst.STATUS_UNPAID,
                Note = $"Hóa đơn cọc lịch hẹn #{appointment.Id}",
                IssuedAt = DateTimeHelper.UtcNow(),
                CreatedAt = DateTimeHelper.UtcNow(),
                CreatedBy = appointment.CreatedByUserId,
                Items = items
            };

            invoiceRepository.Add(invoice);
            await unitOfWork.SaveChangeAsync(cancellationToken);

            var customerEmail = appointment.CreatedByUser?.Email;
            if (string.IsNullOrWhiteSpace(customerEmail))
                return;

            var serviceName = appointment.Services != null && appointment.Services.Any()
                ? string.Join(", ", appointment.Services.Where(s => s.Service != null).Select(s => s.Service!.Name))
                : "Dịch vụ";

            var appointmentTime = appointment.AppointmentDate.ToDateTime(
                appointment.TimeApptStart ?? appointment.TimeSlot?.StartTime ?? new TimeOnly(9, 0));

            var mail = emailTemplateFactory.CreateDepositInvoiceEmail(
                customerEmail,
                appointment.CreatedByUser?.Customer?.FullName ?? appointment.CreatedByUser?.Username ?? "Quý khách",
                serviceName,
                appointmentTime,
                appointment.PaidAmount,
                appointment.TotalAmount - appointment.PaidAmount,
                invoice.InvoiceCode);

            await domainEventPublisher.PublishAsync(new SendEmailEvent
            {
                ToEmail = mail.ToEmail,
                Subject = mail.Subject,
                HtmlBody = mail.HtmlBody,
            }, cancellationToken);
        }
    }
}
