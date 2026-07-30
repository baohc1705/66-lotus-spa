namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Marker cho mọi domain/integration event publish qua MassTransit.
    /// Thêm event mới: tạo class implement interface này + consumer tương ứng.
    /// </summary>
    public interface IDomainEvent
    {
        /// <summary>
        /// ID của event.
        /// </summary>
        Guid EventId { get; }
        /// <summary>
        /// Thời gian xảy ra event (UTC).
        /// </summary>
        DateTimeOffset OccurredOn { get; }
    }
}
