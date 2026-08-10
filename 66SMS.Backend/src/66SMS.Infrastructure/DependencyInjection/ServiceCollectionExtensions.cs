using _66SMS.Contract.Abstractions;
using _66SMS.Contract.Settings;
using _66SMS.Domain.Abstractions.Services;
using _66SMS.Infrastructure.DependencyInjection.Extensions;
using _66SMS.Infrastructure.Excels;
using _66SMS.Infrastructure.Mails;
using _66SMS.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Infrastructure.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,IConfiguration configuration)
        {
            // Jwt service
            services.AddScoped<IJwtService, JwtService>();
            services.AddJwtService(configuration);

            // Cookie
            services.AddScoped<ICookieService, CookieService>();

            // Client IP
            services.AddScoped<IClientIpService, ClientIpService>();

            // Hash pass
            services.AddScoped<IPasswordHash, PasswordHash>();

            // Mail
            services.Configure<MailSettings>(configuration.GetSection(MailSettings.SectionName));
            services.Configure<OtpSettings>(configuration.GetSection(OtpSettings.SectionName));
            services.Configure<ClientAppSettings>(configuration.GetSection(ClientAppSettings.SectionName));
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IEmailTemplateFactory, EmailTemplateFactory>();

            // VnPay
            services.AddVnPayService(configuration);

            // Cloudinary (lưu trữ file/ảnh)
            services.AddCloudinaryStorage(configuration);

            // Redis (cache + rate limit)
            services.AddRedisCache(configuration);

            // MassTransit
            services.AddMassTransitExtensions(configuration);

            // Background jobs (Quartz)
            services.AddBackgroundJobs(configuration);

            // Excel export
            services.AddScoped<IRevenueExcelExportService, RevenueExcelExportService>();

            // SignalR
            services.AddSignalRExtensions();

            return services;
        }
    }
}
