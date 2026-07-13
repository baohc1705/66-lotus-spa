using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceCategory : EntityBase<int>
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public int Status { get; set; }
        public string? Icon { get; set; }
        public string? ImageUrl { get; set; }
        #region Navigation Properties
        public List<Service>? Services { get; set; }
        #endregion
    }
}
