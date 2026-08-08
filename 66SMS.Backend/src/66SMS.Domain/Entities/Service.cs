using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Service : EntityBase<int>
    {
        public int CategoryId { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int DurationMins { get; set; } = 0;
        public decimal CostPrice { get; set; } = 0;
        public decimal SellingPrice { get; set; } = 0;
        public decimal? MinSellingPrice { get; set; }
        public decimal? CommissionRate { get; set; }
        public int? SortOrder { get; set; }
        public int Status { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public string? ImageUrl { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public ServiceCategory? Category { get; set; }
        public List<ServiceImage>? Images { get; set; }
        public List<ServiceProduct>? ServiceProducts { get; set; }
        public List<StaffService>? StaffServices { get; set; }
    }
}
