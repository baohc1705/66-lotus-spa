using System;

namespace _66SMS.Application.DTOs.ConfigAppointments
{
    public class ConfigAppointmentDto
    {
        public int Id { get; set; }
        public int? DepositPercent { get; set; }
        public TimeOnly? StartTime { get; set; }
        public TimeOnly? EndTime { get; set; }
        public int? SlotMinutes { get; set; }
        public int? SalonId { get; set; }
        public string? SalonName { get; set; }
    }
}
