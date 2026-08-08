using _66SMS.Application.BookingService.Helpers;
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

namespace _66SMS.Application.BookingService.Appointments.Commands.PayDepositWithWallet
{
    public sealed class PayDepositWithWalletHandler : IRequestHandler<PayDepositWithWalletCommand, Result<object>>
    {
        private readonly IAppointmentSqlRepository appointmentSqlRepository;
        private readonly IUserSqlRepository userSqlRepository;
        private readonly IWalletSqlRepository walletSqlRepository;
        private readonly IWalletTransactionSqlRepository walletTransactionSqlRepository;
        private readonly IInvoiceSqlRepository invoiceSqlRepository;
        private readonly IConfigAppointmentSqlRepository configAppointmentSqlRepository;
        private readonly IEmailTemplateFactory emailTemplateFactory;
        private readonly IDomainEventPublisher domainEventPublisher;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public PayDepositWithWalletHandler(
            IAppointmentSqlRepository appointmentSqlRepository,
            IUserSqlRepository userSqlRepository,
            IWalletSqlRepository walletSqlRepository,
            IWalletTransactionSqlRepository walletTransactionSqlRepository,
            IInvoiceSqlRepository invoiceSqlRepository,
            IConfigAppointmentSqlRepository configAppointmentSqlRepository,
            IEmailTemplateFactory emailTemplateFactory,
            IDomainEventPublisher domainEventPublisher,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentSqlRepository = appointmentSqlRepository;
            this.userSqlRepository = userSqlRepository;
            this.walletSqlRepository = walletSqlRepository;
            this.walletTransactionSqlRepository = walletTransactionSqlRepository;
            this.invoiceSqlRepository = invoiceSqlRepository;
            this.configAppointmentSqlRepository = configAppointmentSqlRepository;
            this.emailTemplateFactory = emailTemplateFactory;
            this.domainEventPublisher = domainEventPublisher;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(
            PayDepositWithWalletCommand request,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .FirstOrDefaultAsync(a => a.Id == (int)request.AppointmentId!, cancellationToken);

            if (appointment == null)
                return Result<object>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);

            if (appointment.CreatedByUserId != (int)request.UserId!)
                return Result<object>.Forbidden("Bạn không có quyền thanh toán cho lịch hẹn này.");

            if (AppointmentPaymentCalculator.HasDepositPaid(appointment))
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_DEPOSIT_ALREADY_PAID, ErrorCodes.ERR_APPOINTMENT_DEPOSIT_ALREADY_PAID);

            var depositPercent = await AppointmentPaymentCalculator.GetEffectiveDepositPercentAsync(
                appointment, configAppointmentSqlRepository, cancellationToken);

            if (depositPercent == null)
                return Result<object>.BadRequest(
                    ConfigAppointmentConst.MSG_DEPOSIT_PERCENT_NOT_CONFIGURED,
                    ErrorCodes.ERR_CONFIG_APPOINTMENT_NOT_FOUND);

            var depositAmount = AppointmentPaymentCalculator.GetDepositAmount(appointment.TotalAmount, depositPercent.Value);

            if (depositAmount <= 0)
                return Result<object>.BadRequest(AppointmentConst.MSG_APPOINTMENT_DEPOSIT_INVALID_AMOUNT, ErrorCodes.ERR_APPOINTMENT_SLOT_LOCK_INVALID);

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
                return Result<object>.BadRequest(WalletConst.MSG_WALLET_INSUFFICIENT_BALANCE, ErrorCodes.ERR_WALLET_INSUFFICIENT_BALANCE);

            using var transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                wallet.Balance -= depositAmount;
                if (wallet.Id > 0)
                    walletSqlRepository.Update(wallet);

                walletTransactionSqlRepository.Add(new WalletTransaction
                {
                    Wallet = wallet,
                    Amount = -depositAmount,
                    BalanceAfter = wallet.Balance,
                    Type = WalletTransactionConst.TYPE_PAYMENT_FOR_APPOINTMENT,
                    Status = WalletTransactionConst.STATUS_SUCCESS,
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = request.UserId,
                });

                if (!AppointmentPaymentRecorder.TryRecordPayment(
                        appointment,
                        AppointmentPaymentConst.PHASE_DEPOSIT,
                        depositAmount,
                        AppointmentPaymentConst.METHOD_WALLET,
                        null,
                        null,
                        out var error))
                {
                    transaction.Rollback();
                    return Result<object>.BadRequest(error!);
                }

                appointment.Status = AppointmentConst.STATUS_WAITING;
                appointment.UpdatedAt = DateTimeHelper.UtcNow();
                appointment.UpdatedBy = request.UserId;
                appointmentSqlRepository.Update(appointment);

                await CreateDepositInvoiceAndSendEmailAsync(appointment.Id, cancellationToken);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }

            await PublishDepositPaidAsync(appointment, cancellationToken);
            return Result<object>.Success(AppointmentConst.MSG_APPOINTMENT_PAY_DEPOSIT_SUCCESS);
        }

        private async Task PublishDepositPaidAsync(Appointment appointment, CancellationToken cancellationToken)
        {
            var staff = await appointmentSqlRepository.AsQueryable(asNoTracking: true)
                .Where(a => a.Id == appointment.Id)
                .Select(a => new
                {
                    StaffUserId = a.Staff!.UserId,
                    CustomerName = a.CreatedByUser!.Customer!.FullName,
                })
                .FirstOrDefaultAsync(cancellationToken);

            var customerName = staff?.CustomerName;
            var at = DateTimeHelper.UtcNow().ToOffset(TimeSpan.FromHours(7)).ToString("HH:mm dd/MM/yyyy");

            await domainEventPublisher.PublishAsync(new SendNotificationEvent<BookingNotificationPayload>
            {
                Domain = NotificationConst.DOMAIN_BOOKING,
                EventType = NotificationConst.EVENT_DEPOSIT_PAID,
                Title = "Đã thanh toán cọc",
                Message = $"Khách hàng {customerName} vừa thanh toán cọc cho lịch hẹn #{appointment.Id} vào lúc {at}.",
                CustomerMessage = $"Bạn đã thanh toán cọc cho lịch hẹn #{appointment.Id} vào lúc {at}.",
                SalonId = appointment.SalonId,
                CustomerUserId = appointment.CreatedByUserId,
                StaffUserId = staff?.StaffUserId,
                Payload = new BookingNotificationPayload
                {
                    AppointmentId = appointment.Id,
                    StaffId = appointment.StaffId,
                    Status = appointment.Status,
                    CustomerName = staff?.CustomerName,
                    AppointmentDate = appointment.AppointmentDate,
                },
            }, cancellationToken);
        }

        private async Task CreateDepositInvoiceAndSendEmailAsync(
            int appointmentId,
            CancellationToken cancellationToken)
        {
            var appointment = await appointmentSqlRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Services!)
                    .ThenInclude(s => s.Service)
                .Include(a => a.TimeSlot)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u!.Customer!)
                        .ThenInclude(c => c!.MembershipCard!)
                            .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(a => a.Id == appointmentId, cancellationToken);

            if (appointment is null)
                return;

            var hasExistingInvoice = await invoiceSqlRepository.AsQueryable()
                .AnyAsync(i => i.AppointmentId == appointment.Id && i.Status != InvoiceConst.STATUS_CANCELLED, cancellationToken);

            if (hasExistingInvoice)
                return;

            var items = new List<InvoiceItem>();
            decimal subTotal = 0;

            foreach (var appService in appointment.Services ?? [])
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

            var customer = appointment.CreatedByUser?.Customer;
            var (membershipDiscount, promoDiscount, membershipTierId) =
                AppointmentInvoiceDiscountHelper.Split(subTotal, appointment.TotalAmount, customer);

            var invoiceCode = $"HD-{DateTimeHelper.UtcNow():yyyyMMddHHmmssfff}";
            var now = DateTimeHelper.UtcNow();

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
                TotalAmount = appointment.TotalAmount,
                PaidAmount = appointment.PaidAmount,
                PaymentMethod = InvoiceConst.PAYMENT_WALLET,
                Status = InvoiceConst.STATUS_UNPAID,
                Note = appointment.Note,
                IssuedAt = now,
                CreatedAt = now,
                CreatedBy = appointment.CreatedByUserId,
                Items = items,
            });

            var customerEmail = appointment.CreatedByUser?.Email;
            if (string.IsNullOrWhiteSpace(customerEmail))
                return;

            var startTime = appointment.TimeApptStart ?? appointment.TimeSlot?.StartTime;
            if (startTime is null)
                return;

            var serviceName = string.Join(
                ", ",
                (appointment.Services ?? []).Where(s => s.Service != null).Select(s => s.Service!.Name));

            var mail = emailTemplateFactory.CreateDepositInvoiceEmail(
                customerEmail,
                customer?.FullName ?? appointment.CreatedByUser?.Username,
                string.IsNullOrWhiteSpace(serviceName) ? null : serviceName,
                appointment.AppointmentDate.ToDateTime(startTime.Value),
                appointment.PaidAmount,
                appointment.TotalAmount - appointment.PaidAmount,
                invoiceCode);

            await domainEventPublisher.PublishAsync(new SendEmailEvent
            {
                ToEmail = mail.ToEmail,
                Subject = mail.Subject,
                HtmlBody = mail.HtmlBody,
            }, cancellationToken);
        }
    }
}
