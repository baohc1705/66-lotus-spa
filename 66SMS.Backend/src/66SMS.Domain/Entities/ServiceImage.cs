using _66SMS.Domain.Abstractions.Entities;

namespace _66SMS.Domain.Entities
{
    public class ServiceImage : EntityBase<int>
    {
        public int ServiceId { get; set; }
        public string Url { get; set; }
        public int SortOrder { get; set; }
        public bool IsPrimary { get; set; }

        public Service? Service { get; set; }
    }
}
