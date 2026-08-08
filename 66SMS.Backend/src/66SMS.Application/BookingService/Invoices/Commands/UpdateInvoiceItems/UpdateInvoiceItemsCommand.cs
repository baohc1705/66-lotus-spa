using _66SMS.Application.BookingService.Invoices.Commands.CreateInvoice;
using _66SMS.Contract.Shared;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Invoices.Commands.UpdateInvoiceItems
{
    public record UpdateInvoiceItemsCommand : IRequest<Result<object>>
    {
        [JsonIgnore]
        public int Id { get; set; }

        public List<CreateInvoiceItemDto>? Items { get; set; }
        public decimal? DiscountAmount { get; set; } = 0;
        public bool ApplyMembershipDiscount { get; set; } = true;
        public string? Note { get; set; }

        [JsonIgnore]
        public int? UpdatedBy { get; set; }
    }
}
