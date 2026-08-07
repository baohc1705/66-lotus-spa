using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;

namespace _66SMS.Application.Notifications.Commands.ClearMyNotifications
{
    public class ClearMyNotificationsHandler : IRequestHandler<ClearMyNotificationsCommand, Result<object>>
    {
        private readonly INotificationSqlRepository notificationSqlRepository;

        public ClearMyNotificationsHandler(INotificationSqlRepository notificationSqlRepository)
        {
            this.notificationSqlRepository = notificationSqlRepository;
        }

        public async Task<Result<object>> Handle(ClearMyNotificationsCommand request, CancellationToken cancellationToken)
        {
            var deleted = await notificationSqlRepository.ClearByUserAsync(request.UserId, cancellationToken);
            return Result<object>.Success(new { deleted });
        }
    }
}
