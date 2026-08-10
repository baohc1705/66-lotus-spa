using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceImage : EntityBase<int>
    {
        public int ServiceId { get; set; }
        public string Url { get; set; } = null!;
        public int SortOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;

        public Service? Service { get; set; }
    }
}
