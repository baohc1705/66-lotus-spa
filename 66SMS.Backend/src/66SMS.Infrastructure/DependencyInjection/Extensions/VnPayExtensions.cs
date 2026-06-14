using _66SMS.Contracts.Abstractions;
using _66SMS.Contracts.Settings;
using _66SMS.Infrastructure.Payments.VnPay;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace _66SMS.Infrastructure.DependencyInjection.Extensions
{
    public static class VnPayExtensions
    {
        public static IServiceCollection AddVnPayService(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<VnPaySettings>(configuration.GetSection(VnPaySettings.SectionName));
            services.AddScoped<IVnPayService, VnPayService>();
            return services;
        }
    }
}
