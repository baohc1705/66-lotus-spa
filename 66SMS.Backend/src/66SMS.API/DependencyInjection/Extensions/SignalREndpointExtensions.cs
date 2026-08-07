using _66SMS.Infrastructure.Realtime;

namespace _66SMS.API.DependencyInjection.Extensions
{
    public static class SignalREndpointExtensions 
    {
        public const string NotificationsHubPath = "/hubs/notifications";

        public static WebApplication MapNotificationHubs(this WebApplication app)
        {
            app.MapHub<NotificationHub>(NotificationsHubPath);
            return app;
        }
    }
}
