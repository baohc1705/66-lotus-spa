using _66SMS.Application.DTOs.Invoices;
using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.BookingService.Invoices.Queries.GetInvoicePreviewFromAppointment
{
    public record GetInvoicePreviewFromAppointmentQuery : IRequest<Result<InvoicePreviewDTO>>
    {
        public int AppointmentId { get; set; }
    }
}
