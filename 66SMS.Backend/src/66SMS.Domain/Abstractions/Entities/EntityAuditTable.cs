using _66SMS.Domain.Abstractions.Entities.Base;

namespace _66SMS.Domain.Abstractions.Entities
{
    public abstract class EntityAuditTable<TKey> : IAuditTable<TKey>
    {
        public TKey Id { get; set; } = default!;
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? ModifiedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
