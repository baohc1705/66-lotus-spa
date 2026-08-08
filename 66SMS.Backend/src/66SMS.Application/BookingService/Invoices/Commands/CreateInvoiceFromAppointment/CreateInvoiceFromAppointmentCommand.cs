using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Invoices.Commands.CreateInvoiceFromAppointment
{
    public record CreateInvoiceFromAppointmentCommand : IRequest<Result<int>>
    {
        public int AppointmentId { get; set; }

        [JsonIgnore]
        public int? CashierId { get; set; }

        [JsonIgnore]
        public int? CreatedBy { get; set; }
    }
}
