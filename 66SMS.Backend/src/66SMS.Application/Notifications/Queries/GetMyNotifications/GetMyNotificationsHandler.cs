using _66SMS.Contracts.Shared;
using _66SMS.Domain.Abstractions.Repositories.Sql;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace _66SMS.Application.Notifications.Queries.GetMyNotifications
{
    public class GetMyNotificationsHandler : IRequestHandler<GetMyNotificationsQuery, Result<List<NotificationDto>>>
    {
        private readonly INotificationSqlRepository notificationSqlRepository;

        public GetMyNotificationsHandler(INotificationSqlRepository notificationSqlRepository)
        {
            this.notificationSqlRepository = notificationSqlRepository;
        }

        public async Task<Result<List<NotificationDto>>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
        {
            var take = request.Take <= 0 ? 30 : Math.Min(request.Take, 100);

            var query = notificationSqlRepository.AsQueryable()
                .Where(x => x.UserId == request.UserId);

            if (!string.IsNullOrWhiteSpace(request.Domain))
                query = query.Where(x => x.Domain == request.Domain);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new NotificationDto
                {
                    Id = x.Id,
                    Domain = x.Domain,
                    EventType = x.EventType,
                    Title = x.Title,
                    Message = x.Message,
                    SalonId = x.SalonId,
                    PayloadJson = x.PayloadJson,
                    IsRead = x.IsRead,
                    CreatedAt = x.CreatedAt,
                })
                .ToListAsync(cancellationToken);

            return Result<List<NotificationDto>>.Success(items);
        }
    }
}
