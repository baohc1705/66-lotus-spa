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
using _66SMS.Application.Abstractions.Services;

namespace _66SMS.Application.BookingService.Invoices.Commands.CreateInvoice
{
    public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<int>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IServiceSqlRepository serviceRepository;
        private readonly IProductSqlRepository productRepository;
        private readonly ITreatmentCourseSqlRepository treatmentCourseRepository;
        private readonly ICustomerSqlRepository customerRepository;
        private readonly IMembershipCardSqlRepository membershipCardRepository;
        private readonly ILoyaltyPointService loyaltyPointService;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CreateInvoiceHandler(
            IInvoiceSqlRepository invoiceRepository,
            IServiceSqlRepository serviceRepository,
            IProductSqlRepository productRepository,
            ITreatmentCourseSqlRepository treatmentCourseRepository,
            ICustomerSqlRepository customerRepository,
            IMembershipCardSqlRepository membershipCardRepository,
            ILoyaltyPointService loyaltyPointService,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.invoiceRepository = invoiceRepository;
            this.serviceRepository = serviceRepository;
            this.productRepository = productRepository;
            this.treatmentCourseRepository = treatmentCourseRepository;
            this.customerRepository = customerRepository;
            this.membershipCardRepository = membershipCardRepository;
            this.loyaltyPointService = loyaltyPointService;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<int>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            if (request.Items == null || request.Items.Count == 0)
                return Result<int>.BadRequest(InvoiceConst.MSG_NO_ITEMS, ErrorCodes.ERR_INVOICE_NO_ITEMS);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                var items = new List<InvoiceItem>();
                decimal subTotal = 0;

                foreach (var i in request.Items)
                {
                    var quantity = i.Quantity ?? 1;
                    var lineDiscount = i.DiscountAmount ?? 0;
                    string itemName;
                    decimal unitPrice;

                    if (i.ItemType == InvoiceItemConst.TYPE_SERVICE)
                    {
                        var service = await serviceRepository.FindByIdAsync(i.RefId!.Value, true, cancellationToken);
                        if (service == null)
                            return Result<int>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        itemName = service.Name;
                        unitPrice = service.SellingPrice;
                    }
                    else if (i.ItemType == InvoiceItemConst.TYPE_PRODUCT)
                    {
                        var product = await productRepository.FindByIdAsync(i.RefId!.Value, false, cancellationToken);
                        if (product == null)
                            return Result<int>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        if (product.StockQuantity < quantity)
                            return Result<int>.BadRequest(InvoiceConst.MSG_INSUFFICIENT_STOCK, ErrorCodes.ERR_INVOICE_INSUFFICIENT_STOCK);
                        itemName = product.Name;
                        unitPrice = product.SellingPrice ?? 0;
                        product.StockQuantity -= quantity;
                        productRepository.Update(product);
                    }
                    else
                    {
                        var course = await treatmentCourseRepository.FindByIdAsync(i.RefId!.Value, true, cancellationToken);
                        if (course == null)
                            return Result<int>.BadRequest(InvoiceConst.MSG_ITEM_REF_NOT_FOUND, ErrorCodes.ERR_INVOICE_ITEM_REF_NOT_FOUND);
                        itemName = course.Name;
                        unitPrice = course.SellingPrice;
                    }

                    var lineTotal = unitPrice * quantity - lineDiscount;
                    if (lineTotal < 0) lineTotal = 0;
                    subTotal += lineTotal;

                    var item = new InvoiceItem
                    {
                        ItemType = i.ItemType!.Value,
                        RefId = i.RefId!.Value,
                        ItemName = itemName,
                        UnitPrice = unitPrice,
                        Quantity = quantity,
                        LineTotal = lineTotal,
                        StaffId = i.StaffId,
                        Note = i.Note,
                        Status = InvoiceItemConst.STATUS_ACTIVE,
                    };

                    if (lineDiscount != 0)
                        item.DiscountAmount = lineDiscount;

                    if (i.StaffId.HasValue)
                    {
                        var service = await serviceRepository.FindByIdAsync(i.RefId!.Value, true, cancellationToken);
                        if (service?.CommissionRate is decimal rate)
                        {
                            item.CommissionRate = rate;
                            item.CommissionAmount = Math.Round(lineTotal * (rate / 100m), 0);
                        }
                    }

                    items.Add(item);
                }

                // Load khách hàng  để áp dụng membership + loyalty
                Customer? customer = null;
                if (request.CustomerId.HasValue)
                {
                    customer = await customerRepository.FindByIdAsync(request.CustomerId.Value, false, cancellationToken);
                    if (customer == null)
                        return Result<int>.BadRequest("Khách hàng không tồn tại.", ErrorCodes.ERR_CUSTOMER_NOT_FOUND);
                }

                // Giảm giá theo hạng thành viên
                int? tierId = null;
                decimal membershipDiscount = 0;
                decimal pointMultiplier = 1;
                if (customer != null)
                {
                    var tierInfo = await membershipCardRepository.AsQueryable()
                        .Where(c => c.CustomerId == customer.Id && c.Status == MembershipCardConst.STATUS_ACTIVE)
                        .Select(c => new
                        {
                            c.MembershipTierId,
                            DiscountPercent = c.Tier != null ? c.Tier.DiscountPercent : null,
                            PointMultiplier = c.Tier != null ? c.Tier.PointMultiplier : 1,
                        })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (tierInfo != null)
                    {
                        tierId = tierInfo.MembershipTierId;
                        pointMultiplier = tierInfo.PointMultiplier;
                        if (request.ApplyMembershipDiscount && tierInfo.DiscountPercent.HasValue)
                        {
                            membershipDiscount = subTotal * tierInfo.DiscountPercent.Value / 100m;
                        }
                    }
                }

                // Dùng điểm loyalty để trừ tiền
                var pointsUsed = request.LoyaltyPointsUsed ?? 0;
                if (pointsUsed > 0)
                {
                    if (customer == null || (customer.LoyaltyPoint ?? 0) < pointsUsed)
                        return Result<int>.BadRequest(InvoiceConst.MSG_NOT_ENOUGH_POINTS, ErrorCodes.ERR_INVOICE_NOT_ENOUGH_POINTS);
                }
                var pointsValue = pointsUsed * InvoiceConst.POINT_VALUE_VND;

                var manualDiscount = request.DiscountAmount ?? 0;
                var tax = request.TaxAmount ?? 0;
                var total = subTotal - manualDiscount - membershipDiscount - pointsValue + tax;
                if (total < 0) total = 0;

                var paid = request.PaidAmount ?? 0;
                int status;
                decimal change = 0;
                if (paid >= total)
                {
                    status = InvoiceConst.STATUS_PAID;
                    change = paid - total;
                }
                else
                {
                    status = InvoiceConst.STATUS_UNPAID;
                }

                // Điểm tích lũy (chỉ tích khi đã thanh toán đủ)
                int pointsEarned = 0;
                if (status == InvoiceConst.STATUS_PAID && customer != null)
                {
                    pointsEarned = loyaltyPointService.CalculateEarnedPoints(total, pointMultiplier);
                }

                // Cập nhật điểm + lịch sử mua của khách
                if (customer != null)
                {
                    customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) - pointsUsed + pointsEarned;
                    customer.LastPurchaseAt = request.IssuedAt;
                    customer.FirstPurchaseAt ??= request.IssuedAt;
                    customer.UpdatedAt = request.IssuedAt;
                    customerRepository.Update(customer);
                }

                var invoice = new Invoice
                {
                    InvoiceCode = $"HD-{(request.IssuedAt ?? DateTimeHelper.UtcNow()):yyyyMMddHHmmssfff}",
                    CustomerId = request.CustomerId,
                    CustomerName = request.CustomerName ?? customer?.FullName,
                    CustomerPhone = request.CustomerPhone ?? customer?.Phone,
                    AppointmentId = request.AppointmentId,
                    SalonId = request.SalonId,
                    CashierId = request.CashierId,
                    SubTotal = subTotal,
                    MembershipTierId = tierId,
                    TotalAmount = total,
                    PaidAmount = paid,
                    PaymentMethod = request.PaymentMethod ?? InvoiceConst.PAYMENT_CASH,
                    TransactionId = request.TransactionId,
                    Status = status,
                    Note = request.Note,
                    IssuedAt = request.IssuedAt ?? DateTimeHelper.UtcNow(),
                    CreatedAt = request.IssuedAt ?? DateTimeHelper.UtcNow(),
                    CreatedBy = request.CreatedBy,
                    Items = items,
                };

                if (manualDiscount != 0)
                    invoice.DiscountAmount = manualDiscount;
                if (membershipDiscount != 0)
                    invoice.MembershipDiscountAmount = membershipDiscount;
                if (pointsUsed != 0)
                    invoice.LoyaltyPointsUsed = pointsUsed;
                if (pointsValue != 0)
                    invoice.LoyaltyPointsValue = pointsValue;
                if (pointsEarned != 0)
                    invoice.LoyaltyPointsEarned = pointsEarned;
                if (tax != 0)
                    invoice.TaxAmount = tax;
                if (change != 0)
                    invoice.ChangeAmount = change;

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
