namespace _66SMS.Application.DTOs.TreatmentCourses
{
    public class TreatmentCourseDTO
    {
        public int? Id { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int? TotalSessions { get; set; }
        public decimal? OriginalPrice { get; set; }
        public decimal? SellingPrice { get; set; }
        public string? ImageUrl { get; set; }
        public int? SortOrder { get; set; }
        public int? Status { get; set; }
        public string? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public string? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }
        public List<TreatmentCourseItemDTO>? Items { get; set; }
    }
}
