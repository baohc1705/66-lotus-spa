using _66SMS.Contract.Abstractions;
using _66SMS.Infrastructure.Realtime;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    public static class SignalRExtensions
    {
        public static IServiceCollection AddSignalRExtensions(this IServiceCollection services)
        {
            services.AddSignalR();
            services.AddScoped<INotificationService, NotificationService>();
            return services;
        }
    }
}
