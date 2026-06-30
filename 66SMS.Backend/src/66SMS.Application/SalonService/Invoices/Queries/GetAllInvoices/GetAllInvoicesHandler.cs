using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contracts.Extensions;
using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using _66SMS.Domain.Constants;
using MediatR;

namespace _66SMS.Application.SalonService.Invoices.Queries.GetAllInvoices
{
    public class GetAllInvoicesHandler : IRequestHandler<GetAllInvoicesQuery, Result<PagedResult<InvoiceDTO>>>
    {
        private readonly IInvoiceSqlRepository invoiceRepository;

        public GetAllInvoicesHandler(IInvoiceSqlRepository invoiceRepository)
        {
            this.invoiceRepository = invoiceRepository;
        }

        public async Task<Result<PagedResult<InvoiceDTO>>> Handle(GetAllInvoicesQuery request, CancellationToken cancellationToken)
        {
            var query = invoiceRepository.AsQueryable();

            if (!string.IsNullOrEmpty(request.Filter))
            {
                query = query.Where(x => x.InvoiceCode.Contains(request.Filter)
                    || (x.CustomerName != null && x.CustomerName.Contains(request.Filter))
                    || (x.CustomerPhone != null && x.CustomerPhone.Contains(request.Filter)));
            }

            if (request.Status.HasValue)
                query = query.Where(x => x.Status == request.Status);

            if (request.CustomerId.HasValue)
                query = query.Where(x => x.CustomerId == request.CustomerId);

            if (request.SalonId.HasValue)
                query = query.Where(x => x.SalonId == request.SalonId);

            if (request.FromDate.HasValue)
                query = query.Where(x => x.IssuedAt >= request.FromDate);

            if (request.ToDate.HasValue)
                query = query.Where(x => x.IssuedAt <= request.ToDate);

            query = request.OrderBy?.ToLower() switch
            {
                "code" => request.IsDescending ? query.OrderByDescending(x => x.InvoiceCode) : query.OrderBy(x => x.InvoiceCode),
                "total" => request.IsDescending ? query.OrderByDescending(x => x.TotalAmount) : query.OrderBy(x => x.TotalAmount),
                _ => request.IsDescending ? query.OrderByDescending(x => x.IssuedAt) : query.OrderBy(x => x.IssuedAt)
            };

            var result = await query
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
                    SubTotal = x.SubTotal,
                    DiscountAmount = x.DiscountAmount,
                    MembershipDiscountAmount = x.MembershipDiscountAmount,
                    TotalAmount = x.TotalAmount,
                    PaidAmount = x.PaidAmount,
                    PaymentMethod = x.PaymentMethod,
                    Status = x.Status,
                    IssuedAt = x.IssuedAt.ToString(),
                    CreatedAt = x.CreatedAt.ToString(),
                })
                .ToPagedAsync(request, cancellationToken);

            return Result<PagedResult<InvoiceDTO>>.Success(result);
        }
    }
}
