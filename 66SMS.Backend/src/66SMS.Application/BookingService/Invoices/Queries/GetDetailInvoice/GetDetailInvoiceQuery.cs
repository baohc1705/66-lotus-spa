using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Invoices.Queries.GetDetailInvoice
{
    public class GetDetailInvoiceQuery : IRequest<Result<InvoiceDTO>>
    {
        public int Id { get; set; }
    }
}
