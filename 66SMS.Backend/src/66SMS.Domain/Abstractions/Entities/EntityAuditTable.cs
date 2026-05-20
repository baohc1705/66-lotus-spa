using _66SMS.Domain.Abstractions.Entities.Base;

namespace _66SMS.Domain.Abstractions.Entities
{
    public abstract class EntityAuditTable<TKey> : IAuditTable<TKey>
    {
        public TKey Id { get; set ; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? ModifiedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
