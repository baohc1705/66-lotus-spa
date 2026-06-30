using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Attendance : EntityBase<int>
    {
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? WorkScheduleId { get; set; }
        public DateOnly WorkDate { get; set; }
        public DateTime? CheckInAt { get; set; }
        public DateTime? CheckOutAt { get; set; }
        public decimal WorkedHours { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
        public WorkSchedule? WorkSchedule { get; set; }
    }
}
