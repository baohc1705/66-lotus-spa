using System.Data;
using _66SMS.Contract.Enumerations;
using _66SMS.Contract.Helpers;
using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using _66SMS.Domain.Entities;
using _66SMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.BookingService.Invoices.Commands.UpdateInvoiceItems
{
    public class UpdateInvoiceItemsHandler : IRequestHandler<UpdateInvoiceItemsCommand, Result<object>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IServiceSqlRepository serviceRepository;
        private readonly IProductSqlRepository productRepository;
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;
        private readonly IMembershipCardSqlRepository membershipCardRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public UpdateInvoiceItemsHandler(
            IInvoiceSqlRepository invoiceRepository,
            IServiceSqlRepository serviceRepository,
            IProductSqlRepository productRepository,
            ITreatmentCourseSqlRepository treatmentCourseRepository,
            IMembershipCardSqlRepository membershipCardRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.invoiceRepository = invoiceRepository;
            this.serviceRepository = serviceRepository;
            this.productRepository = productRepository;
            this.treatmentCourseRepository = treatmentCourseRepository;
            this.membershipCardRepository = membershipCardRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(UpdateInvoiceItemsCommand request, CancellationToken cancellationToken)
        {
            if (request.Items == null || request.Items.Count == 0)
                return Result<object>.BadRequest(InvoiceConst.MSG_NO_ITEMS, ErrorCodes.ERR_INVOICE_NO_ITEMS);

            var invoice = await invoiceRepository.AsQueryable(false)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (invoice == null)
                return Result<object>.NotFound(InvoiceConst.MSG_NOT_FOUND, ErrorCodes.ERR_INVOICE_NOT_FOUND);

            if (invoice.Status != InvoiceConst.STATUS_UNPAID && invoice.Status != InvoiceConst.STATUS_DRAFT)
                return Result<object>.BadRequest("Chỉ có thể cập nhật mặt hàng khi hóa đơn chưa thanh toán.", ErrorCodes.ERR_INVOICE_ALREADY_PAID);

            var productIds = invoice.Items!
                .Where(x => x.Status == (int)StatusActiveEnum.ACTIVED && x.ItemType == InvoiceItemConst.TYPE_PRODUCT)
                .Select(x => x.RefId)
                .Concat(request.Items.Where(x => x.ItemType == InvoiceItemConst.TYPE_PRODUCT).Select(x => x.RefId!.Value))
                .Distinct()
                .ToList();

            var serviceIds = request.Items
                .Where(x => x.ItemType == InvoiceItemConst.TYPE_SERVICE)
                .Select(x => x.RefId!.Value)
                .Distinct()
                .ToList();

            var courseIds = request.Items
                .Where(x => x.ItemType == InvoiceItemConst.TYPE_TREATMENT_COURSE)
                .Select(x => x.RefId!.Value)
                .Distinct()
                .ToList();

            var products = await productRepository
                .AsQueryable(false)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync(cancellationToken);

            var services = await serviceRepository
                .AsQueryable(true)
                .Where(s => serviceIds.Contains(s.Id))
                .ToListAsync(cancellationToken);

            var courses = await treatmentCourseRepository
                .AsQueryable(true)
                .Where(c => courseIds.Contains(c.Id))
                .ToListAsync(cancellationToken);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                foreach (var oldItem in invoice.Items!)
                {
                    if (oldItem.Status != (int)StatusActiveEnum.ACTIVED) continue;
                    if (oldItem.ItemType == InvoiceItemConst.TYPE_PRODUCT)
                    {
                        var product = products.FirstOrDefault(p => p.Id == oldItem.RefId);
                        if (product != null)
                            product.StockQuantity += oldItem.Quantity;
                    }
                    oldItem.Status = (int)StatusActiveEnum.DELETED;
                }

                decimal subTotal = 0;
                foreach (var i in request.Items)
                {
                    var quantity = i.Quantity ?? 1;
                    var lineDiscount = i.DiscountAmount ?? 0;
                    string itemName;
                    decimal unitPrice;
                    decimal? commissionRate = null;

                    if (i.ItemType == InvoiceItemConst.TYPE_SERVICE)
                    {
                        var service = services.FirstOrDefault(s => s.Id == i.RefId!.Value);
                        if (service == null)
                            return Result<object>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        itemName = service.Name;
                        unitPrice = service.SellingPrice;
                        if (i.StaffId.HasValue && service.CommissionRate.HasValue)
                            commissionRate = service.CommissionRate.Value;
                    }
                    else if (i.ItemType == InvoiceItemConst.TYPE_PRODUCT)
                    {
                        var product = products.FirstOrDefault(p => p.Id == i.RefId!.Value);
                        if (product == null)
                            return Result<object>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        if (product.StockQuantity < quantity)
                            return Result<object>.BadRequest(InvoiceConst.MSG_INSUFFICIENT_STOCK, ErrorCodes.ERR_INVOICE_INSUFFICIENT_STOCK);
                        itemName = product.Name;
                        unitPrice = product.SellingPrice ?? 0;
                        product.StockQuantity -= quantity;
                    }
                    else
                    {
                        var course = courses.FirstOrDefault(c => c.Id == i.RefId!.Value);
                        if (course == null)
                            return Result<object>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        itemName = course.Name;
                        unitPrice = course.SellingPrice;
                    }

                    var lineTotal = unitPrice * quantity - lineDiscount;
                    if (lineTotal < 0) lineTotal = 0;
                    subTotal += lineTotal;

                    var item = new InvoiceItem
                    {
                        InvoiceId = invoice.Id,
                        ItemType = i.ItemType!.Value,
                        RefId = i.RefId!.Value,
                        ItemName = itemName,
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        LineTotal = lineTotal,
                        StaffId = i.StaffId,
                        Note = i.Note,
                        Status = (int)StatusActiveEnum.ACTIVED,
                    };

                    if (lineDiscount != 0)
                        item.DiscountAmount = lineDiscount;

                    if (commissionRate is decimal rate)
                    {
                        item.CommissionRate = rate;
                        item.CommissionAmount = Math.Round(lineTotal * (rate / 100m), 0);
                    }

                    invoice.Items.Add(item);
                }

                int? tierId = invoice.MembershipTierId;
                decimal membershipDiscount = 0;
                if (request.ApplyMembershipDiscount && invoice.CustomerId.HasValue)
                {
                    var tierInfo = await membershipCardRepository.AsQueryable()
                        .Where(c => c.CustomerId == invoice.CustomerId && c.Status == (int)StatusActiveEnum.ACTIVED)
                        .Select(c => new
                        {
                            c.MembershipTierId,
                            DiscountPercent = c.Tier != null ? c.Tier.DiscountPercent : null,
                        })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (tierInfo?.DiscountPercent != null)
                    {
                        tierId = tierInfo.MembershipTierId;
                        membershipDiscount = subTotal * tierInfo.DiscountPercent.Value / 100m;
                    }
                }

                var discount = request.DiscountAmount ?? 0;
                var total = subTotal - discount - membershipDiscount - invoice.LoyaltyPointsValue + invoice.TaxAmount;
                if (total < 0) total = 0;

                if (invoice.PaidAmount > total)
                    return Result<object>.BadRequest("Tổng tiền hóa đơn không được nhỏ hơn số tiền đã thu (cọc).", ErrorCodes.ERR_INVOICE_INVALID);

                invoice.SubTotal = subTotal;
                invoice.DiscountAmount = discount;
                invoice.MembershipTierId = tierId;
                invoice.MembershipDiscountAmount = membershipDiscount;
                invoice.TotalAmount = total;
                if (request.Note != null)
                    invoice.Note = request.Note;
                invoice.UpdatedAt = DateTimeHelper.UtcNow();
                invoice.UpdatedBy = request.UpdatedBy;
                invoiceRepository.Update(invoice);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Success("Cập nhật mặt hàng hóa đơn thành công.");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
