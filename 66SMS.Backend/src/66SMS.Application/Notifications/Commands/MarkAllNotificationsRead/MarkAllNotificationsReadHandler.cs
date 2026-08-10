using _66SMS.Contract.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.Notifications.Commands.MarkAllNotificationsRead
{
    public class MarkAllNotificationsReadHandler : IRequestHandler<MarkAllNotificationsReadCommand, Result<object>>
    {
        private readonly INotificationSqlRepository notificationSqlRepository;

        public MarkAllNotificationsReadHandler(INotificationSqlRepository notificationSqlRepository)
        {
            this.notificationSqlRepository = notificationSqlRepository;
        }

        public async Task<Result<object>> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
        {
            var updated = await notificationSqlRepository.MarkAllReadByUserAsync(request.UserId, cancellationToken);
            return Result<object>.Success(new { updated });
        }
    }
}
