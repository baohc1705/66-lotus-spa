namespace _66SMS.Application.DTOs
{
    public class TreatmentCourseItemDTO
    {
        public int? Id { get; set; }
        public int? TreatmentCourseId { get; set; }
        public int? ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public int? SessionNumber { get; set; }
        public int? Quantity { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
    }
}
