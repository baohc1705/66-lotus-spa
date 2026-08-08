namespace _66SMS.Domain.Abstractions.Entities.Base
{
    public interface IAuditTable<TKey> : IEntityBase<TKey>, IDateTracking, ISoftDeleted
    {
    }
}
