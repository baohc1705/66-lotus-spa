using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Notifications.Commands.MarkAllNotificationsRead
{
    public class MarkAllNotificationsReadCommand : IRequest<Result<object>>
    {
        public int UserId { get; set; }
    }
}
