using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    /// <summary>
    /// Product image entity
    /// </summary>
    public class ProductImage : EntityBase<int>
    {
        public int ProductId { get; set; }
        public string Url { get; set; } = null!;
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }

        public Product? Product { get; set; }
    }
}
