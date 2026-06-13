using _66SMS.Application.Abstractions;
using _66SMS.Application.Abstractions.Behaviors;
using _66SMS.Application.Commons.Mappers;
using _66SMS.Application.Services.Appointments;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

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
                cfg.AddProfile(typeof(ApplicationMappingProfiles));
            });
            services.AddScoped<IBookingAvailabilityService, BookingAvailabilityService>();
            return services;
        }
    }
}
