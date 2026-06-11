using _66SMS.Application.DTOs.ProductImages;

namespace _66SMS.Application.DTOs.Products
{
    public class ProductDto
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string? Unit { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int? StockQuantity { get; set; }
        public int? MinStock { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public string? UpdatedAt { get; set; }
        
        public List<ProductImageDto>? Images { get; set; }
    }
}
