using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.SalonService.Invoices.Queries.GetDetailInvoice
{
    public class GetDetailInvoiceQuery : IRequest<Result<InvoiceDTO>>
    {
        public int Id { get; set; }
    }
}
