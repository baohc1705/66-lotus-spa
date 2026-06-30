using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Invoice : EntityBase<int>
    {
        public string InvoiceCode { get; set; } = null!;
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? AppointmentId { get; set; }
        public int? SalonId { get; set; }
        public int? CashierId { get; set; }

        public decimal SubTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public int? MembershipTierId { get; set; }
        public decimal MembershipDiscountAmount { get; set; }
        public int LoyaltyPointsUsed { get; set; }
        public decimal LoyaltyPointsValue { get; set; }
        public int LoyaltyPointsEarned { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal ChangeAmount { get; set; }
        public int PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public DateTime IssuedAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public Customer? Customer { get; set; }
        public Salon? Salon { get; set; }
        public List<InvoiceItem>? Items { get; set; }
    }
}
