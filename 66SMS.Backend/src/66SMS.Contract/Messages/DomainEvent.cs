using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Helpers;

namespace _66SMS.Contract.Messages
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
