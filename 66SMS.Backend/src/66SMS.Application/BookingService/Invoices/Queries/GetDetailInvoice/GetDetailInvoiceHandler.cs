using _66SMS.Application.DTOs;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Invoices.Queries.GetDetailInvoice
{
    public class GetDetailInvoiceHandler : IRequestHandler<GetDetailInvoiceQuery, Result<InvoiceDTO>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;

        public GetDetailInvoiceHandler(IInvoiceSqlRepository invoiceRepository)
        {
            this.invoiceRepository = invoiceRepository;
        }

        public async Task<Result<InvoiceDTO>> Handle(GetDetailInvoiceQuery request, CancellationToken cancellationToken)
        {
            var invoice = await invoiceRepository
                .AsQueryable()
                .Where(x => x.Id == request.Id)
                .Select(x => new InvoiceDTO
                {
                    Id = x.Id,
                    InvoiceCode = x.InvoiceCode,
                    CustomerId = x.CustomerId,
                    CustomerName = x.CustomerName,
                    CustomerPhone = x.CustomerPhone,
                    AppointmentId = x.AppointmentId,
                    SalonId = x.SalonId,
                    SalonName = x.Salon != null ? x.Salon.Name : null,
                    CashierId = x.CashierId,
                    SubTotal = x.SubTotal,
                    DiscountAmount = x.DiscountAmount,
                    MembershipTierId = x.MembershipTierId,
                    MembershipDiscountAmount = x.MembershipDiscountAmount,
                    LoyaltyPointsUsed = x.LoyaltyPointsUsed,
                    LoyaltyPointsValue = x.LoyaltyPointsValue,
                    LoyaltyPointsEarned = x.LoyaltyPointsEarned,
                    TaxAmount = x.TaxAmount,
                    TotalAmount = x.TotalAmount,
                    PaidAmount = x.PaidAmount,
                    ChangeAmount = x.ChangeAmount,
                    PaymentMethod = x.PaymentMethod,
                    TransactionId = x.TransactionId,
                    Status = x.Status,
                    Note = x.Note,
                    IssuedAt = x.IssuedAt.ToString(),
                    CreatedAt = x.CreatedAt.ToString(),
                    CreatedBy = x.CreatedBy,
                    UpdatedAt = x.UpdatedAt.ToString(),
                    UpdatedBy = x.UpdatedBy,
                    Items = x.Items != null ? x.Items
                        .Where(i => i.Status == InvoiceItemConst.STATUS_ACTIVE)
                        .Select(i => new InvoiceItemDTO
                        {
                            Id = i.Id,
                            InvoiceId = i.InvoiceId,
                            ItemType = i.ItemType,
                            RefId = i.RefId,
                            ItemName = i.ItemName,
                            UnitPrice = i.UnitPrice,
                            Quantity = i.Quantity,
                            DiscountAmount = i.DiscountAmount,
                            LineTotal = i.LineTotal,
                            StaffId = i.StaffId,
                            StaffName = i.Staff != null ? i.Staff.FullName : null,
                            Note = i.Note,
                            Status = i.Status,
                            CommissionRate = i.CommissionRate,
                            CommissionAmount = i.CommissionAmount,
                        }).ToList() : null,
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (invoice == null)
                return Result<InvoiceDTO>.NotFound(InvoiceConst.MSG_NOT_FOUND, ErrorCodes.ERR_INVOICE_NOT_FOUND);

            return Result<InvoiceDTO>.Success(invoice);
        }
    }
}
