using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Appointment : EntityBase<int>
    {
        public string AppointmentCode { get; set; } = null!;
        public int CreatedByUserId { get; set; }
        public int StaffId { get; set; }
        public int SlotId { get; set; }
        public int? PositionId { get; set; }
        public int? LockId { get; set; }
        public int? SalonId { get; set; }
        public int? ScheduleId { get; set; }
        public DateOnly AppointmentDate { get; set; }
        public int? Source { get; set; }
        public int Status { get; set; }
        public string? Note { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public int? DepositPercent { get; set; }
        public DateTimeOffset? DepositDeadlineAt { get; set; }
        public DateTimeOffset? DepositRequestedAt { get; set; }
        public DateTimeOffset? ConfirmedAt { get; set; }
        public DateTimeOffset? CompletedAt { get; set; }
        public DateTimeOffset? TimeStartService { get; set; }

        public DateTimeOffset CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        // Navigation properties
        public User? CreatedByUser { get; set; }
        public Staff? Staff { get; set; }
        public TimeSlot? TimeSlot { get; set; }
        public BookingPosition? Position { get; set; }
        public WorkSchedule? Schedule { get; set; }
        public AppointmentSlotLock? Lock { get; set; }

        public ICollection<AppointmentSlotLock>? SlotLocks { get; set; }
        public ICollection<AppointmentService>? Services { get; set; }
        public ICollection<AppointmentPayment>? Payments { get; set; }
        public Salon? Salon { get; set; }
    }
}
