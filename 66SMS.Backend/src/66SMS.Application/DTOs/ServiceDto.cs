namespace _66SMS.Application.DTOs
{
    public class ServiceDto
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? DurationMins { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public decimal? MinSellingPrice { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public string? ImageUrl { get; set; }
        public DateTimeOffset? CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public List<ServiceProductResponse>? ServiceProducts { get; set; }

        // Tiền sản phẩm tiêu hao
        public decimal? ProductCost => ServiceProducts != null
            ? Math.Round(ServiceProducts.Sum(sp => (sp.QuantityUsed ?? 0) * (sp.UnitCost ?? 0)), 0)
            : null;

        // Tổng giá vốn (chi phí gốc + tiêu hao)
        public decimal? TotalCost => CostPrice != null
            ? Math.Round(CostPrice.Value + (ProductCost ?? 0), 0)
            : null;

        // Tiền hoa hồng
        public decimal? CommissionAmount => (SellingPrice != null && CommissionRate != null)
            ? Math.Round(SellingPrice.Value * CommissionRate.Value / 100, 0)
            : null;

        // Lợi nhuận gộp
        public decimal? GrossProfit => (SellingPrice != null && TotalCost != null)
            ? Math.Round(SellingPrice.Value - TotalCost.Value - (CommissionAmount ?? 0), 0)
            : null;

        // % biên lợi nhuận gộp
        public decimal? GrossMarginPercent => (SellingPrice == null || SellingPrice == 0 || GrossProfit == null)
            ? null
            : Math.Round(GrossProfit.Value / SellingPrice.Value * 100, 2);
    }

    public class ServiceProductResponse
    {
        public int? Id { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? UnitCost { get; set; }
        public int? QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
