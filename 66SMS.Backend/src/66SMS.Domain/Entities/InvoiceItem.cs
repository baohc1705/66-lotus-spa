using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class InvoiceItem : EntityBase<int>
    {
        public int InvoiceId { get; set; }
        public int ItemType { get; set; }
        public int RefId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; } = 0;
        public int Quantity { get; set; } = 0;
        public decimal DiscountAmount { get; set; } = 0;
        public decimal LineTotal { get; set; } = 0;
        public int? StaffId { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }
        public decimal? CommissionRate { get; set; }
        public decimal CommissionAmount { get; set; } = 0;

        public Invoice? Invoice { get; set; }
        public Staff? Staff { get; set; }
    }
}
