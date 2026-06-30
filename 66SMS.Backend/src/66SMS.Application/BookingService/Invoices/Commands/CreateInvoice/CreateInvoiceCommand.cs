using _66SMS.Contracts.Shared;
using _66SMS.Domain.Constants;
using MediatR;
using System.Text.Json.Serialization;

namespace _66SMS.Application.BookingService.Invoices.Commands.CreateInvoice
{
    public record CreateInvoiceCommand : IRequest<Result<int>>
    {
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? AppointmentId { get; set; }
        public int? SalonId { get; set; }

        public decimal? DiscountAmount { get; set; } = 0;
        public bool ApplyMembershipDiscount { get; set; } = true;
        public int? LoyaltyPointsUsed { get; set; } = 0;
        public decimal? TaxAmount { get; set; } = 0;

        public int? PaymentMethod { get; set; } = InvoiceConst.PAYMENT_CASH;
        public decimal? PaidAmount { get; set; } = 0;
        public string? TransactionId { get; set; }
        public string? Note { get; set; }

        public List<CreateInvoiceItemDto>? Items { get; set; }

        [JsonIgnore]
        public int? CashierId { get; set; }
        [JsonIgnore]
        public int? CreatedBy { get; set; }
        [JsonIgnore]
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    }

    public class CreateInvoiceItemDto
    {
        public int? ItemType { get; set; }
        public int? RefId { get; set; }
        public int? Quantity { get; set; } = 1;
        public decimal? DiscountAmount { get; set; } = 0;
        public int? StaffId { get; set; }
        public string? Note { get; set; }
    }
}
