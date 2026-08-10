using _66SMS.Contract.Messages;

namespace _66SMS.Contract.Abstractions
{
    public interface INotificationService 
    {
        Task NofifyAsync<TPayload>(SendNotificationEvent<TPayload> notificationEvent,  CancellationToken cancellationToken = default) where TPayload: class;
    }
}
