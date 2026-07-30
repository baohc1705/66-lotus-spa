namespace _66SMS.Contracts.Abstractions
{
    /// <summary>
    /// Publisher cho mọi domain/integration event publish qua MassTransit.
    /// </summary>
    public interface IDomainEventPublisher
    {
        /// <summary>
        /// Publish một event.
        /// </summary>
        /// <typeparam name="TEvent">Type của event.</typeparam>
        /// <param name="domainEvent">Event cần publish.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Task.</returns>
        Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default) where TEvent : class, IDomainEvent;
    }
}