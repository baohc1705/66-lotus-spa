using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Invoices.Queries.GetAllInvoices
{
    public class GetAllInvoicesQuery : PageRequest, IRequest<Result<PagedResult<InvoiceDTO>>>
    {
        public int? Status { get; set; }
        public int? CustomerId { get; set; }
        public int? SalonId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
