using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Notifications.Commands.ClearMyNotifications
{
    public class ClearMyNotificationsCommand : IRequest<Result<object>>
    {
        public int UserId { get; set; }
    }
}
