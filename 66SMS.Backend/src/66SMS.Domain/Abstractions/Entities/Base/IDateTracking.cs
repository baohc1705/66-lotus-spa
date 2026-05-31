namespace _66SMS.Domain.Abstractions.Entities.Base
{
    public interface IDateTracking
    {
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
