using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceCategory : EntityBase<int>
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public int Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        public List<Service>? Services { get; set; }
    }
}
