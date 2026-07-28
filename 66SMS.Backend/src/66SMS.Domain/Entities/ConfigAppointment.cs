using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ConfigAppointment : EntityBase<int>
    {
        public int? DepositPercent { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public int? SlotMinutes { get; set; }
        public int? SalonId { get; set; }

        public Salon? Salon { get; set; }
    }
}
