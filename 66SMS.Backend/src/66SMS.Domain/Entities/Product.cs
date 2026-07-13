using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    /// <summary>
    /// Product entity
    /// </summary>
    public class Product : EntityBase<int>
    {
        public int CategoryId { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string Unit { get; set; } = null!;
        public decimal CostPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public int StockQuantity { get; set; }
        public int MinStock { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public ProductCategory? Category { get; set; }
        public List<ProductImage>? Images { get; set; }
    }
}
