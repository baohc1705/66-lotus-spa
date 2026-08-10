using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    /// <summary>
    /// Product category entity
    /// </summary>
    public class ProductCategory : EntityBase<int>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int SortOrder { get; set; } = 0;
        public int Status { get; set; }

        public List<Product>? Products { get; set; }
    }
}
