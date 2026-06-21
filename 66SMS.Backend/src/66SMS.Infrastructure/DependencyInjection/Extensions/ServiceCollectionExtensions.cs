using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Infrastructure.Mails;
using _66SMS.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,IConfiguration configuration)
        {
            // Jwt service
            services.AddScoped<IJwtService, JwtService>();
            services.AddJwtService(configuration);

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
            return services;
        }
    }
}
