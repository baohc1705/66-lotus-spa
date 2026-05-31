using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class Shift : EntityBase<int>
    {
        public string Name { get; set; }
        public string? Description { get; set; }

        public List<ShiftPeriod>? ShiftPeriods { get; set; }
    }
}
