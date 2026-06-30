using _66SMS.Contracts.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Invoices.Commands.CancelInvoice
{
    public record CancelInvoiceCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }
        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
