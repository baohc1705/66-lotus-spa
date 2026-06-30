namespace _66SMS.Application.DTOs.Invoices
{
    public class InvoiceItemDTO
    {
        public int? Id { get; set; }
        public int? InvoiceId { get; set; }
        public int? ItemType { get; set; }
        public int? RefId { get; set; }
        public string? ItemName { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? Quantity { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? LineTotal { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
