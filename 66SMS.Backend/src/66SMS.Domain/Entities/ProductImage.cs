using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ProductImage : EntityBase<int>
    {
        public int ProductId { get; set; }
        public string Url { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }

        public Product? Product { get; set; }
    }
}
