using System.Collections.Generic;

namespace _66SMS.Application.DTOs.Invoices
{
    public class InvoicePreviewDTO
    {
        public int AppointmentId { get; set; }
        public string? AppointmentCode { get; set; }
        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public int? SalonId { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal AlreadyPaid { get; set; }
        public decimal RemainingAmount { get; set; }
        public bool CanCreateInvoice { get; set; }
        public string? ExistingInvoiceCode { get; set; }
        public List<InvoicePreviewItemDTO> Items { get; set; } = new();
    }

    public class InvoicePreviewItemDTO
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        public int? StaffId { get; set; }
        public string? StaffName { get; set; }
    }
}
