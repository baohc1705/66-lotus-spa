using _66SMS.Contracts.Enumerations;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Abstractions.Repositories.Sql.Base;
using _66SMS.Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace _66SMS.Application.BookingService.Invoices.Commands.CancelInvoice
{
    public class CancelInvoiceHandler : IRequestHandler<CancelInvoiceCommand, Result<object>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;
        private readonly IProductSqlRepository productRepository;
        private readonly ICustomerSqlRepository customerRepository;
        private readonly ISqlUnitOfWork sqlUnitOfWork;

        public CancelInvoiceHandler(
            IInvoiceSqlRepository invoiceRepository,
            IProductSqlRepository productRepository,
            ICustomerSqlRepository customerRepository,
            ISqlUnitOfWork sqlUnitOfWork)
        {
            this.invoiceRepository = invoiceRepository;
            this.productRepository = productRepository;
            this.customerRepository = customerRepository;
            this.sqlUnitOfWork = sqlUnitOfWork;
        }

        public async Task<Result<object>> Handle(CancelInvoiceCommand request, CancellationToken cancellationToken)
        {
            var invoice = await invoiceRepository.AsQueryable(false)
                .Include(x => x.Items)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (invoice == null)
                return Result<object>.NotFound(InvoiceConst.MSG_NOT_FOUND, ErrorCodes.ERR_INVOICE_NOT_FOUND);

            if (invoice.Status == InvoiceConst.STATUS_CANCELLED || invoice.Status == InvoiceConst.STATUS_REFUNDED)
                return Result<object>.BadRequest(InvoiceConst.MSG_CANNOT_CANCEL, ErrorCodes.ERR_INVOICE_CANNOT_CANCEL);

            using IDbTransaction transaction = await sqlUnitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // Hoàn kho cho các dòng sản phẩm
                if (invoice.Items != null)
                {
                    foreach (var item in invoice.Items)
                    {
                        if (item.Status != InvoiceItemConst.STATUS_ACTIVE) continue;
                        if (item.ItemType == InvoiceItemConst.TYPE_PRODUCT)
                        {
                            var product = await productRepository.FindByIdAsync(item.RefId, false, cancellationToken);
                            if (product != null)
                            {
                                product.StockQuantity += item.Quantity;
                                product.UpdatedAt = DateTime.UtcNow;
                                product.UpdatedBy = request.UpdatedBy;
                                productRepository.Update(product);
                            }
                        }
                        item.Status = InvoiceItemConst.STATUS_DELETED;
                    }
                }

                // Hoàn lại điểm loyalty (cộng lại điểm đã dùng, trừ điểm đã tích)
                if (invoice.CustomerId.HasValue && (invoice.LoyaltyPointsUsed > 0 || invoice.LoyaltyPointsEarned > 0))
                {
                    var customer = await customerRepository.FindByIdAsync(invoice.CustomerId.Value, false, cancellationToken);
                    if (customer != null)
                    {
                        customer.LoyaltyPoint = (customer.LoyaltyPoint ?? 0) + invoice.LoyaltyPointsUsed - invoice.LoyaltyPointsEarned;
                        if (customer.LoyaltyPoint < 0) customer.LoyaltyPoint = 0;
                        customer.UpdatedAt = DateTime.UtcNow;
                        customer.UpdatedBy = request.UpdatedBy;
                        customerRepository.Update(customer);
                    }
                }

                invoice.Status = InvoiceConst.STATUS_CANCELLED;
                invoice.UpdatedAt = DateTime.UtcNow;
                invoice.UpdatedBy = request.UpdatedBy;
                invoiceRepository.Update(invoice);

                await sqlUnitOfWork.SaveChangeAsync(cancellationToken);
                transaction.Commit();

                return Result<object>.Ok();
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
    }
}
