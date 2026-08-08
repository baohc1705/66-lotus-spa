namespace _66SMS.Domain.Abstractions.Entities.Base
{
    public interface IDateTracking
    {
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? ModifiedAt { get; set; }
    }
}
