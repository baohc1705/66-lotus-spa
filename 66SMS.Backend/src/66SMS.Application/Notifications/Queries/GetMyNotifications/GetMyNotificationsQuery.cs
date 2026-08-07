using _66SMS.Contracts.Shared;
using MediatR;

namespace _66SMS.Application.Notifications.Queries.GetMyNotifications
{
    public class GetMyNotificationsQuery : IRequest<Result<List<NotificationDto>>>
    {
        public int UserId { get; set; }
        public string? Domain { get; set; }
        public int Take { get; set; } = 30;
    }
}
