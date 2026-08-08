using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Invoices.Queries.GetAllInvoices
{
    public class GetAllInvoicesQuery : PageRequest, IRequest<Result<PagedResult<InvoiceDTO>>>
    {
        public int? Status { get; set; }
        public int? CustomerId { get; set; }
        public int? SalonId { get; set; }
        public DateTimeOffset? FromDate { get; set; }
        public DateTimeOffset? ToDate { get; set; }
        public int? PaymentMethod { get; set; }
    }
}
