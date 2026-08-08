using _66SMS.Contract.Abstractions;
using MassTransit;

namespace _66SMS.Infrastructure.Messagings;

/// <summary>
/// Publisher cho mọi domain/integration event publish qua MassTransit.
/// </summary>
public class DomainEventPublisher : IDomainEventPublisher
{
    /// <summary>
    /// Endpoint publish.
    /// </summary>
    private readonly IPublishEndpoint publishEndpoint;

    public DomainEventPublisher(IPublishEndpoint publishEndpoint)
    {
        this.publishEndpoint = publishEndpoint;
    }


    /// <summary>
    /// Publish một event.
    /// </summary>
    /// <typeparam name="TEvent">Type của event.</typeparam>
    /// <param name="domainEvent">Event cần publish.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Task.</returns>
    public Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken) where TEvent : class, IDomainEvent
    {
        return publishEndpoint.Publish(domainEvent, cancellationToken);
    }
}
