using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using _66SMS.Contract.Settings;
using _66SMS.Contract.Abstractions;
using _66SMS.Infrastructure.Messagings;
using MassTransit;
using _66SMS.Infrastructure.Consumers;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions;

public static class MassTransitExtensions
{
    public static IServiceCollection AddMassTransitExtensions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RabbitMqSettings>(configuration.GetSection(RabbitMqSettings.SectionName));
        var rabbit = configuration.GetSection(RabbitMqSettings.SectionName).Get<RabbitMqSettings>() ?? new RabbitMqSettings();
        services.AddScoped<IDomainEventPublisher, DomainEventPublisher>();
        services.AddMassTransit(x =>
        {
            x.AddConsumer<SendEmailConsumer>();
            x.AddConsumer<CreatedUserConsumer>();
            x.UsingRabbitMq((context, cfg) =>
            {
                cfg.Host(rabbit.Host, h =>
                {
                    h.Username(rabbit.Username);
                    h.Password(rabbit.Password);
                });
                cfg.ConfigureEndpoints(context);
            });
        });
        return services;
    }
}
