using _66SMS.Domain.Entities;

namespace _66SMS.Application.DTOs.Shifts
{
    public class ShiftDTO
    {
        public int? Id {get; set;}
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<ShiftPeriodDTO>? ShiftPeriodDTOs {get; set;}
    }

    public class ShiftPeriodDTO
    {
        public int? Id {get; set;}
        public TimeOnly? ShiftStart { get; set; }
        public TimeOnly? ShiftEnd { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.Now;
    }
}