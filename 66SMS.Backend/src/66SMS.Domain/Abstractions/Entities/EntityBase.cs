using _66SMS.Domain.Abstractions.Entities.Base;

namespace _66SMS.Domain.Abstractions.Entities
{
    public abstract class EntityBase<TKey> : IEntityBase<TKey>
    {
        public TKey Id { get; set; }
    }
}
