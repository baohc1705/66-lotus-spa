using _66SMS.Domain.Abstractions.Entities.Base;

namespace _66SMS.Domain.Abstractions.Entities
{
    public abstract class EntityAuditTable<TKey> : IAuditTable<TKey>
    {
        public TKey Id { get; set ; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
