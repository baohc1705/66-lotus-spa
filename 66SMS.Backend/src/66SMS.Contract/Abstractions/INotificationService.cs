using _66SMS.Contracts.Messages;

namespace _66SMS.Contracts.Abstractions
{
    public interface INotificationService 
    {
        Task NofifyAsync<TPayload>(SendNotificationEvent<TPayload> notificationEvent,  CancellationToken cancellationToken = default) where TPayload: class;
    }
}
