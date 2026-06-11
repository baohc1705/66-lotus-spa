using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceProduct : EntityBase<int>
    {
        public int ServiceId { get; set; }
        public int ProductId { get; set; }
        public int QuantityUsed { get; set; }
        public string? Note { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Service? Service { get; set; }
        public Product? Product { get; set; }
    }
}
