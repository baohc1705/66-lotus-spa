using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceProduct : EntityBase<int>
    {
        public int ServiceId { get; set; }
        public int ProductId { get; set; }
        public int QuantityUsed { get; set; }
        public string? Note { get; set; }
        public decimal? UnitCost { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public Service? Service { get; set; }
        public Product? Product { get; set; }
    }
}
