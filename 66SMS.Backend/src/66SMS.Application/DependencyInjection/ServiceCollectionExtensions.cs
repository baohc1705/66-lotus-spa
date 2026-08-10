using _66SMS.Application.Abstractions.Behaviors;
using _66SMS.Application.BookingService.Helpers;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using _66SMS.Application.Abstractions.Services;

namespace _66SMS.Application.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = typeof(ServiceCollectionExtensions).Assembly;

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });

            services.AddValidatorsFromAssembly(assembly);

            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(assembly);
            });
            services.AddScoped<ILoyaltyPointService, LoyaltyPointService>();
            return services;
        }
    }
}
