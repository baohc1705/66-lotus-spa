using _66SMS.Application.Abstractions.Services;
using _66SMS.Application.BookingService.Helpers;
using _66SMS.Application.DTOs;
using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Constants;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Messages;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Messages;
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
        private readonly IEmailTemplateFactory emailTemplateFactory;
        private readonly IDomainEventPublisher domainEventPublisher;
        private readonly ISqlUnitOfWork unitOfWork;

        public VnPayReturnHandler(
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
        {
            this.vnPayService = vnPayService;
            this.appointmentRepository = appointmentRepository;
            this.walletRepository = walletRepository;
            this.walletTransactionRepository = walletTransactionRepository;
            this.invoiceRepository = invoiceRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.loyaltyPointService = loyaltyPointService;
            this.emailTemplateFactory = emailTemplateFactory;
            this.domainEventPublisher = domainEventPublisher;
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

            if (apply.Data == true)
            {
                appointmentRepository.Update(appointment);

                if (result.Phase == AppointmentPaymentConst.PHASE_FINAL_PAYMENT
                    && appointment.TotalAmount > 0)
                {
                    await loyaltyPointService.AddPointsAndCheckUpgradeAsync(
                        appointment.CreatedByUserId,
                        appointment.TotalAmount,
                        appointment.CreatedByUserId,
                        cancellationToken);
                }

                if (result.Phase == AppointmentPaymentConst.PHASE_FINAL_PAYMENT)
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
                
                if (result.Phase == AppointmentPaymentConst.PHASE_DEPOSIT)
                {
                    await CreateDepositInvoiceAndSendEmailAsync(appointment.Id, cancellationToken);
                    await PublishDepositPaidAsync(appointment, cancellationToken);
                }
            }

            return Result<VnPayReturnDto>.Success(new VnPayReturnDto
            {
                AppointmentId = result.AppointmentId,
                PaymentPhase = phaseKey,
                Message = apply.Message
            });
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

            var customerName = info?.CustomerName;
            var at = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_DEPOSIT_PAID,
                Title = "Đã thanh toán cọc",
                Message = $"Khách hàng {customerName} vừa thanh toán cọc cho lịch hẹn #{appointment.Id} vào lúc {at}.",
                Payload = new BookingNotificationPayload
                {
                    CustomerMessage = $"Bạn đã thanh toán cọc cho lịch hẹn #{appointment.Id} vào lúc {at}.",
                    SalonId = appointment.SalonId,
                    CustomerUserId = appointment.CreatedByUserId,
                    StaffUserId = info?.StaffUserId,
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

                    var item = new InvoiceItem
                    {
                        ItemType = InvoiceItemConst.TYPE_SERVICE,
                        RefId = appService.ServiceId,
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        LineTotal = lineTotal,
                        StaffId = appointment.StaffId,
                        Status = InvoiceItemConst.STATUS_ACTIVE,
                    };
                    if (appService.Service != null)
                        item.ItemName = appService.Service.Name;

                    if (appService.Service?.CommissionRate is decimal rate)
                    {
                        item.CommissionRate = rate;
                        item.CommissionAmount = Math.Round(lineTotal * (rate / 100m), 0);
                    }

                    items.Add(item);
                }
            }

            var customer = appointment.CreatedByUser?.Customer;
            var (membershipDiscount, promoDiscount, membershipTierId) = AppointmentInvoiceDiscountHelper.Split(subTotal, appointment.TotalAmount, customer);

            var invoice = new Invoice
            {
                InvoiceCode = $"HD-{DateTimeHelper.UtcNow():yyyyMMddHHmmssfff}",
                CustomerId = customer?.Id,
                CustomerName = customer?.FullName ?? appointment.CreatedByUser?.Username,
                CustomerPhone = customer?.Phone,
                AppointmentId = appointment.Id,
                SalonId = appointment.SalonId,
                SubTotal = subTotal,
                DiscountAmount = promoDiscount,
                MembershipTierId = membershipTierId,
                MembershipDiscountAmount = membershipDiscount,
                TotalAmount = appointment.TotalAmount,
                PaidAmount = appointment.PaidAmount,
                PaymentMethod = InvoiceConst.PAYMENT_BANK_TRANSFER,
                Status = InvoiceConst.STATUS_UNPAID,
                Note = appointment.Note,
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

            var startTime = appointment.TimeApptStart;
            if (startTime is null)
                return;

            var serviceLines = new List<MailAppointmentServiceLine>();
            if (appointment.Services != null)
            {
                foreach (var appService in appointment.Services)
                {
                    serviceLines.Add(new MailAppointmentServiceLine
                    {
                        Name = appService.Service != null ? appService.Service.Name : "Dịch vụ",
                        DurationMins = appService.DurationSnapshot * appService.Quantity,
                        Price = appService.PriceSnapshot * appService.Quantity,
                    });
                }
            }

            var mail = emailTemplateFactory.CreateDepositInvoiceEmail(
                customerEmail,
                appointment.CreatedByUser?.Customer?.FullName ?? appointment.CreatedByUser?.Username,
                appointment.AppointmentDate.ToDateTime(startTime.Value),
                appointment.PaidAmount,
                appointment.TotalAmount - appointment.PaidAmount,
                invoice.InvoiceCode,
                serviceLines);

            await domainEventPublisher.PublishAsync(new SendEmailEvent
            {
                ToEmail = mail.ToEmail,
                Subject = mail.Subject,
                HtmlBody = mail.HtmlBody,
            }, cancellationToken);
        }
    }
}
