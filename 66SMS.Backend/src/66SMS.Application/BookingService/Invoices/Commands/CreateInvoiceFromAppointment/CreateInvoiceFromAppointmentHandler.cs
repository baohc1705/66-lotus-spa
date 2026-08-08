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
using System.Data;

namespace _66SMS.Application.BookingService.Invoices.Commands.CreateInvoiceFromAppointment
{
    public class CreateInvoiceFromAppointmentHandler : IRequestHandler<CreateInvoiceFromAppointmentCommand, Result<int>>
    {
        private readonly IAppointmentSqlRepository appointmentRepository;
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateInvoiceFromAppointmentHandler(
            IAppointmentSqlRepository appointmentRepository,
            IInvoiceSqlRepository invoiceRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.appointmentRepository = appointmentRepository;
            this.invoiceRepository = invoiceRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CreateInvoiceFromAppointmentCommand request, CancellationToken cancellationToken)
        {

            var appointment = await appointmentRepository.AsQueryable(asNoTracking: false)
                .Include(a => a.Payments)
                .Include(a => a.Services!)
                    .ThenInclude(s => s.Service)
                .Include(a => a.CreatedByUser!)
                    .ThenInclude(u => u.Customer!)
                        .ThenInclude(c => c!.MembershipCard!)
                            .ThenInclude(mc => mc!.Tier)
                .FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken);

            if (appointment == null)
            {
                return Result<int>.NotFound(AppointmentConst.MSG_APPOINTMENT_NOT_FOUND, ErrorCodes.ERR_APPOINTMENT_NOT_FOUND);
            }


            if (appointment.Status != AppointmentConst.STATUS_COMPLETED)
            {
                return Result<int>.BadRequest("Lịch hẹn chưa hoàn thành phục vụ để tạo hóa đơn.", ErrorCodes.ERR_APPOINTMENT_ALREADY_THIS_STATUS);
            }

            var hasExistingInvoice = await invoiceRepository.AsQueryable()
                .AnyAsync(i => i.AppointmentId == appointment.Id && i.Status != InvoiceConst.STATUS_CANCELLED, cancellationToken);

            if (hasExistingInvoice)
            {
                return Result<int>.Conflict("Hóa đơn đã được tạo cho lịch hẹn này.", ErrorCodes.ERR_INVOICE_ALREADY_PAID);
            }

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
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

                var isPaid = appointment.PaidAmount >= appointment.TotalAmount;
                var status = isPaid ? InvoiceConst.STATUS_PAID : InvoiceConst.STATUS_UNPAID;

                var lastPayment = appointment.Payments?
                    .Where(p => p.Status == AppointmentPaymentConst.STATUS_PAID)
                    .OrderByDescending(p => p.CreatedAt)
                    .FirstOrDefault();

                int paymentMethod = InvoiceConst.PAYMENT_CASH;
                if (lastPayment != null)
                {
                    paymentMethod = lastPayment.Method switch
                    {
                        AppointmentPaymentConst.METHOD_CASH => InvoiceConst.PAYMENT_CASH,
                        AppointmentPaymentConst.METHOD_BANK_TRANSFER => InvoiceConst.PAYMENT_BANK_TRANSFER,
                        AppointmentPaymentConst.METHOD_WALLET => InvoiceConst.PAYMENT_WALLET,
                        _ => InvoiceConst.PAYMENT_BANK_TRANSFER
                    };
                }

                var customer = appointment.CreatedByUser?.Customer;

                var (membershipDiscount, promoDiscount, membershipTierId) =
                    AppointmentInvoiceDiscountHelper.Split(subTotal, appointment.TotalAmount, customer);

                var invoice = new Invoice
                {
                    InvoiceCode = $"HD-{DateTimeHelper.UtcNow():yyyyMMddHHmmssfff}",
                    CustomerId = customer?.Id,
                    CustomerName = customer?.FullName ?? appointment.CreatedByUser?.Username,
                    CustomerPhone = customer?.Phone,
                    AppointmentId = appointment.Id,
                    SalonId = appointment.SalonId,
                    CashierId = request.CashierId,
                    SubTotal = subTotal,
                    DiscountAmount = promoDiscount,
                    MembershipTierId = membershipTierId,
                    MembershipDiscountAmount = membershipDiscount,
                    TotalAmount = appointment.TotalAmount,
                    PaidAmount = appointment.PaidAmount,
                    PaymentMethod = paymentMethod,
                    Status = status,
                    Note = appointment.Note,
                    IssuedAt = DateTimeHelper.UtcNow(),
                    CreatedAt = DateTimeHelper.UtcNow(),
                    CreatedBy = request.CreatedBy,
                    Items = items
                };

                invoiceRepository.Add(invoice);
                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<int>.Created(invoice.Id);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
