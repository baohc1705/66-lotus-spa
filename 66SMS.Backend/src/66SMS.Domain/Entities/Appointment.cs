using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Appointment : EntityBase<int>
    {
        public string AppointmentCode { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public int CreatedByUserId { get; set; }
        public int StaffId { get; set; }
        public int SlotId { get; set; }
        public int PositionId { get; set; }
        public int? LockId { get; set; }
        public int? ScheduleId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int? Source { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public int? DepositPercent { get; set; }
        public DateTime? DepositDeadlineAt { get; set; }
        public DateTime? DepositRequestedAt { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        // Navigation properties
        public Customer? Customer { get; set; }
        public User? CreatedByUser { get; set; }
        public Staff? Staff { get; set; }
        public TimeSlot? TimeSlot { get; set; }
        public BookingPosition? Position { get; set; }
        public WorkSchedule? Schedule { get; set; }
        public AppointmentSlotLock? Lock { get; set; }

        public ICollection<AppointmentSlotLock> SlotLocks { get; set; } = new List<AppointmentSlotLock>();
        public ICollection<AppointmentService> Services { get; set; } = new List<AppointmentService>();
        public ICollection<AppointmentPayment> Payments { get; set; } = new List<AppointmentPayment>();
        public ICollection<AppointmentHistory> Histories { get; set; } = new List<AppointmentHistory>();
    }
}
