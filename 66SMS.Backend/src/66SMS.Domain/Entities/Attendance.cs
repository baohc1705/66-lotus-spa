using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    /// <summary>
    /// Attendance entity 
    /// </summary>
    public class Attendance : EntityBase<int>
    {
        public int StaffId { get; set; }
        public int? SalonId { get; set; }
        public int? WorkScheduleId { get; set; }
        public DateOnly WorkDate { get; set; }
        public DateTimeOffset? CheckInAt { get; set; }
        public DateTimeOffset? CheckOutAt { get; set; }
        public decimal WorkedHours { get; set; } = 0;
        public int Status { get; set; }
        public string? Note { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }

        public Staff? Staff { get; set; }
        public Salon? Salon { get; set; }
        public WorkSchedule? WorkSchedule { get; set; }
    }
}
