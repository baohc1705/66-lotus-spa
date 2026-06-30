namespace _66SMS.Application.DTOs.Invoices
{
    public class InvoiceDTO
    {
        public int? Id { get; set; }
        public string? InvoiceCode { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? AppointmentId { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
        public int? CashierId { get; set; }
        public decimal? SubTotal { get; set; }
        public decimal? DiscountAmount { get; set; }
        public int? MembershipTierId { get; set; }
        public decimal? MembershipDiscountAmount { get; set; }
        public int? LoyaltyPointsUsed { get; set; }
        public decimal? LoyaltyPointsValue { get; set; }
        public int? LoyaltyPointsEarned { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? PaidAmount { get; set; }
        public decimal? ChangeAmount { get; set; }
        public int? PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public int? Status { get; set; }
        public string? Note { get; set; }
        public string? IssuedAt { get; set; }
        public string? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public List<InvoiceItemDTO>? Items { get; set; }
    }
}
