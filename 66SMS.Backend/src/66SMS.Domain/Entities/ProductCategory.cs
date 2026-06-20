using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ProductCategory : EntityBase<int>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public int Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        
        public List<Product>? Products { get; set; }
    }
}
