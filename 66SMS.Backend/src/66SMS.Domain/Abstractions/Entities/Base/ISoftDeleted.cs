namespace _66SMS.Domain.Abstractions.Entities.Base
{
    public interface ISoftDeleted
    {
        public bool IsDeleted { get; set; }
    }
}
