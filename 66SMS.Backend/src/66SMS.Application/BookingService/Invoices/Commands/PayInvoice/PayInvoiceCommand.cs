using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Invoices.Commands.PayInvoice
{
    public record PayInvoiceCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        public int PaymentMethod { get; set; }
        public decimal PaidAmount { get; set; }
        public string? Note { get; set; }

        [JsonIgnore]
        public int? CashierId { get; set; }
    }
}
