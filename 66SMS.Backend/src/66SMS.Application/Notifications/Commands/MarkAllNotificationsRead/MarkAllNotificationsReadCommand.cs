using _66SMS.Contract.Shared;
using MediatR;

namespace _66SMS.Application.Notifications.Commands.MarkAllNotificationsRead
{
    public class MarkAllNotificationsReadCommand : IRequest<Result<object>>
    {
        public int UserId { get; set; }
    }
}
