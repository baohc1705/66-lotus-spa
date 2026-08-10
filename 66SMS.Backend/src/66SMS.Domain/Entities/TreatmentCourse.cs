using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class TreatmentCourse : EntityBase<int>
    {
        public int? CategoryId { get; set; }
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int TotalSessions { get; set; } = 0;
        public decimal OriginalPrice { get; set; } = 0;
        public decimal SellingPrice { get; set; } = 0;
        public string? ImageUrl { get; set; }
        public int? SortOrder { get; set; }
        public int Status { get; set; }

        public DateTimeOffset CreatedAt { get; set; }

        public ServiceCategory? Category { get; set; }
        public List<TreatmentCourseItem>? Items { get; set; }
    }
}
