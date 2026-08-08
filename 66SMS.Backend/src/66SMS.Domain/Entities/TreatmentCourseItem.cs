using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class TreatmentCourseItem : EntityBase<int>
    {
        public int TreatmentCourseId { get; set; }
        public int ServiceId { get; set; }
        public int SessionNumber { get; set; } = 0;
        public int Quantity { get; set; } = 0;
        public string? Note { get; set; }
        public int Status { get; set; }

        public TreatmentCourse? Course { get; set; }
        public Service? Service { get; set; }
    }
}
