using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class InvoiceItem : EntityBase<int>
    {
        public int InvoiceId { get; set; }
        public int ItemType { get; set; }
        public int RefId { get; set; }
        public string ItemName { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal LineTotal { get; set; }
        public int? StaffId { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }

        public Invoice? Invoice { get; set; }
        public Staff? Staff { get; set; }
    }
}
