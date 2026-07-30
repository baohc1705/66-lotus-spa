using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Helpers;

namespace _66SMS.Contracts.Messages
{
    /// <summary>
    /// Base class cho mọi domain/integration event publish qua MassTransit.
    /// </summary>
    public abstract class DomainEvent : IDomainEvent
    {
        /// <summary>
        /// ID của event.
        /// </summary>
        public Guid EventId { get; } = Guid.NewGuid();
        /// <summary>
        /// Thời gian xảy ra event (UTC).
        /// </summary>
        public DateTimeOffset OccurredOn { get; } = DateTimeHelper.UtcNow();
    }
}
