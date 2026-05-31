namespace _66SMS.Domain.Abstractions.Entities.Base
{
    public interface IEntityBase<TKey>
    {
        public TKey Id { get; set; }
    }
}
